export const getDramas = series => series.filter(show => show.genre = "Drama");

export const getEpisodeById = (season, idText) =>
  season.episodes.find(episode => episode.id === idText);

export const addEpisodeToFirstSeason = (show, episode) => {
  const firstSeason = show.seasons[0];
  firstSeason.episodes.push(episode);
  return { ...show };
};