import { reportMapper } from '../../data/api-mapper';

export default class ReportDetailPresenter {
  #reportId;
  #view;
  #apiModel;
  #dbModel;

  constructor(reportId, { view, apiModel, dbModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showReportDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showReportDetail() {
    this.#view.showReportDetailLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#reportId);

      if (!response.ok) {
        console.error('showReportDetailAndMap: response:', response);
        this.#view.populateReportDetailError(response.message);
        return;
      }

      const transformedReports = {
        ...response.data,
        latitude: response.data.lat,
        longitude: response.data.lon,
      };

      const story = await reportMapper(transformedReports);

      this.#view.populateReportDetailAndInitialMap(response.message, story);
      console.log('showReportDetailAndMap: response:', story);
    } catch (error) {
      console.error('showReportDetailAndMap: error:', error);
      this.#view.populateReportDetailError(error.message);
    } finally {
      this.#view.hideReportDetailLoading();
    }
  }

  async saveReport() {
    try {
      const report = await this.#apiModel.getStoryById(this.#reportId);
      await this.#dbModel.putReport(report.data);
      this.#view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveReport: error:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeReport() {
    try {
      await this.#dbModel.removeReport(this.#reportId);
      this.#view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    } catch (error) {
      console.error('removeReport: error:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }
    this.#view.renderSaveButton();
  }
  async #isReportSaved() {
    return !!(await this.#dbModel.getReportById(this.#reportId));
  }
}
