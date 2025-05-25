import { reportMapper } from '../../data/api-mapper';
export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportsListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showReportsListMap();

      const response = await this.#model.getAllStories();

      if (!response.ok) {
        console.error('initialGalleryAndMap: response:', response);
        this.#view.populateReportsListError(response.message);
        return;
      }

      const transformedReports = response.data
        .filter((story) => story && story.lat != null && story.lon != null) // filter data invalid
        .map((story) => ({
          ...story,
          latitud: story.lat,
          lonitud: story.lon,
        }));

      const mappedStories = await Promise.all(
        transformedReports.map((story) => reportMapper(story)),
      );

      this.#view.populateReportsList(response.message, mappedStories);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateReportsListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
