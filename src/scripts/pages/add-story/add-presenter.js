export default class AddPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewReport(data) {
    if (
      !data.photo ||
      !(data.photo instanceof File) ||
      data.photo.size === 0 ||
      data.photo.size > 1024 * 1024
    ) {
      this.#view.storeFailed(
        'Foto tidak valid. Harus berupa file gambar dengan ukuran maksimal 1MB.',
      );
      return;
    }

    try {
      const result = await this.#model.storeNewStoryGuest({
        description: data.description,
        photo: data.photo,
        lat: data.lat,
        lon: data.lon,
      });

      if (!result.error) {
        this.#view.storeSuccessfully(result.message);
      } else {
        this.#view.storeFailed(result.message);
      }
    } catch (err) {
      this.#view.storeFailed(err.message);
    }
  }
}
