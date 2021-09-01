export function isNewCommFilled(commDetail) {
	return commDetail
		&& commDetail.title?.length
		&& (commDetail.releaseAsap || (commDetail.firstReleaseDate && moment(commDetail.firstReleaseDate).isSameOrAfter(moment(), "day")))
}
