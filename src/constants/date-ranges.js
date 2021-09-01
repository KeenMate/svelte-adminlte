import moment from "moment"

export const dateRangeLabels = {
	yesterday: "Včera",
	tomorrow: "Zítra",
	today: "Dnes",
	lastWeek: "Poslední týden",
	lastMonth: "Poslední měsíc",
	lastYear: "Poslední rok",
	nextWeek: "Následující týden",
	nextMonth: "Následující měsíc",
	nextYear: "Následující rok",
}

export function todayDateRange() {
	const today = moment()
	return [today, today]
}

export function yesterdayDateRange() {
	const yesterday = moment().subtract(1, "day")
	return [yesterday, yesterday]
}

export function lastWeekDateRange() {
	return [
		moment().subtract(1, "week"),
		moment()
	]
}

export function lastMonthDateRange() {
	return [
		moment().subtract(1, "month"),
		moment()
	]
}

export function lastYearDateRange() {
	return [
		moment().subtract(1, "year"),
		moment()
	]
}

export function tomorrowDateRange() {
	const tomorrow = moment().add(1, "day")
	return [tomorrow, tomorrow]
}

export function nextWeekDateRange() {
	return [
		moment(),
		moment().add(1, "week")
	]
}

export function nextMonthDateRange() {
	return [
		moment(),
		moment().add(1, "month")
	]
}

export function nextYearDateRange() {
	return [
		moment(),
		moment().add(1, "year")
	]
}

export function pastFromToRanges() {
	return {
		[dateRangeLabels.yesterday]: yesterdayDateRange(),
		[dateRangeLabels.today]: todayDateRange(),
		[dateRangeLabels.lastWeek]: lastWeekDateRange(),
		[dateRangeLabels.lastMonth]: lastMonthDateRange(),
		[dateRangeLabels.lastYear]: lastYearDateRange(),
	}
}

export function getFutureFromToRanges() {
	return {
		[dateRangeLabels.today]: todayDateRange(),
		[dateRangeLabels.tomorrow]: yesterdayDateRange(),
		[dateRangeLabels.nextWeek]: nextWeekDateRange(),
		[dateRangeLabels.nextMonth]: nextMonthDateRange(),
		[dateRangeLabels.nextYear]: nextYearDateRange(),
	}
}
