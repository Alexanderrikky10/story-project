import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  /// Stories
  STORY_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_STORY: `${BASE_URL}/stories`,
  STORE_NEW_STORY_GUEST: `${BASE_URL}/stories/guest`,

  // Report Comment
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ok: fetchResponse.ok && !json.error,
    message: json.message,
    loginResult: json.loginResult,
    raw: json, // optional: if you want to debug or access everything
  };
}

// stories
export async function getAllStories({ page = 1, size = 10, location = 0 } = {}) {
  const token = getAccessToken();

  const fetchResponse = await fetch(
    `${ENDPOINTS.STORY_LIST}?page=${page}&size=${size}&location=${location}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const json = await fetchResponse.json();

  return {
    ...json,
    data: json.listStory, // <- ubah listStory jadi field `data`
    ok: fetchResponse.ok,
  };
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    data: json.story, // Mengakses objek 'story' dari respons
  };
}

export async function storeNewStory({
  description,
  photo, // array dengan maksimal 1 item
  lat,
  lon,
}) {
  const accessToken = getAccessToken();
  const formData = new FormData();

  formData.set('description', description);

  if (photo) {
    formData.append('photo', photo); // cukup langsung append satu file
  }

  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  try {
    const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData, // jangan set Content-Type, FormData handle otomatis
    });

    const json = await fetchResponse.json();
    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
    };
  }
}

export async function storeNewStoryGuest({
  description,
  photo, // file gambar tunggal
  lat,
  lon,
}) {
  const formData = new FormData();

  formData.set('description', description);

  if (photo) {
    formData.append('photo', photo); // pastikan hanya satu file dan valid image
  }

  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  try {
    const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY_GUEST, {
      method: 'POST',
      body: formData, // FormData akan otomatis set Content-Type
    });

    const json = await fetchResponse.json();
    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
    };
  }
}





export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
  });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}



