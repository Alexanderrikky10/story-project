import Map from '../utils/map';

export async function reportMapper(report) {
  // Ambil nilai properti yang sudah kamu map sebelumnya
  const latitude = report.latitude ?? report.lat;
  const longitude = report.longitude ?? report.lon;

  return {
    ...report,
    latitude, // override atau menegaskan ulang
    longitude, // override atau menegaskan ulang
    placeName: await Map.getPlaceNameByCoordinate(latitude, longitude),
  };
}
