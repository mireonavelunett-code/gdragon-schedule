
import { schedules } from "./data.js";

// DOM 요소
const pastScheduleList = document.getElementById("past-schedule-list");
const pastCount = document.getElementById("past-count");

const yearFilter = document.getElementById("year-filter");
const monthFilter = document.getElementById("month-filter");
const memberFilter = document.getElementById("member-filter");

// 날짜 설정
const today = new Date();

const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

function getEndDate(item) {
  return item.endDate || item.date;
}

function getMembers(item) {
  if (!item.member) return [];
  return Array.isArray(item.member) ? item.member : [item.member];
}

function getDateLabel(item) {
  if (!item.endDate || item.endDate === item.date) {
    return item.date;
  }
  return `${item.date} ~ ${item.endDate}`;
}

// 기간 겹침 확인
function overlapsPeriod(item, periodStart, periodEnd) {
  return item.date <= periodEnd && getEndDate(item) >= periodStart;
}

// 지난 일정 추출 및 정렬
const pastSchedules = schedules
  .filter(item => getEndDate(item) < todayString)
  .sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.time || "").localeCompare(a.time || "");
  });

// 연도 필터 생성
const years = [
  ...new Set(
    pastSchedules.flatMap(item => {
      const startYear = Number(item.date.slice(0, 4));
      const endYear = Number(getEndDate(item).slice(0, 4));

      return Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => String(startYear + i)
      );
    })
  )
].sort((a, b) => b.localeCompare(a));

years.forEach(year => {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = `${year}년`;
  yearFilter.appendChild(option);
});

// 아티스트 필터 생성
const members = [
  ...new Set(pastSchedules.flatMap(item => getMembers(item)))
].sort();

members.forEach(member => {
  const option = document.createElement("option");
  option.value = member;
  option.textContent = member;
  memberFilter.appendChild(option);
});

// 월 필터 확인
function matchesMonth(item, selectedMonth, selectedYear) {
  const startYear = Number(item.date.slice(0, 4));
  const endYear = Number(getEndDate(item).slice(0, 4));

  for (let year = startYear; year <= endYear; year++) {
    if (selectedYear !== "all" && String(year) !== selectedYear) {
      continue;
    }

    const monthStart = `${year}-${selectedMonth}-01`;
    const lastDay = new Date(year, Number(selectedMonth), 0).getDate();
    const monthEnd = `${year}-${selectedMonth}-${String(lastDay).padStart(2, "0")}`;

    if (overlapsPeriod(item, monthStart, monthEnd)) return true;
  }

  return false;
}

// 일정 항목 생성
function createScheduleArticle(item) {
  const article = document.createElement("article");
  article.className = "schedule-item archive-schedule-item";

  const dateBlock = document.createElement("div");
  dateBlock.className = "schedule-date-block";

  const date = document.createElement("p");
  date.className = "schedule-date";

  const dateMonth = document.createElement("span");
  dateMonth.className = "schedule-date-month";
  dateMonth.textContent = item.date.slice(0, 7).replace("-", ".");

  const dateDay = document.createElement("strong");
  dateDay.className = "schedule-date-day";
  dateDay.textContent = item.date.slice(8, 10);

  date.append(dateMonth, dateDay);

  const dateRange = document.createElement("span");
  dateRange.className = "schedule-date-range";
  dateRange.textContent = getDateLabel(item);

  dateBlock.append(date, dateRange);

  const content = document.createElement("div");
  content.className = "schedule-content";

  const time = document.createElement("p");
  time.className = "schedule-date-time";
  time.textContent = item.time || "시간 미정";

  const title = document.createElement("h3");
  title.className = "schedule-title";
  title.textContent = item.title;

  const meta = document.createElement("p");
  meta.className = "schedule-meta";
  meta.textContent = [
    getMembers(item).join(" · "),
    item.location
  ].filter(Boolean).join(" · ");

  content.append(time, title);

  if (meta.textContent) {
    content.appendChild(meta);
  }

  const extras = document.createElement("div");
  extras.className = "schedule-extras";

  if (item.category) {
    const category = document.createElement("span");
    category.className = "schedule-category";
    category.textContent = item.category;
    extras.appendChild(category);
  }

  if (item.source) {
    const sources = Array.isArray(item.source) ? item.source : [item.source];

    sources.forEach((url, index) => {
      if (!url) return;

      const source = document.createElement("a");
      source.href = url;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.className = "schedule-source";
      source.textContent = sources.length > 1
        ? `출처 ${index + 1} ↗`
        : "공식 출처 ↗";

      extras.appendChild(source);
    });
  }

  if (extras.children.length > 0) {
    content.appendChild(extras);
  }

  article.append(dateBlock, content);
  return article;
}

// 일정 렌더링
function renderPastSchedules() {
  const selectedYear = yearFilter.value;
  const selectedMonth = monthFilter.value;
  const selectedMember = memberFilter.value;

  const filteredSchedules = pastSchedules.filter(item => {
    let yearMatch = true;
    let monthMatch = true;

    if (selectedYear !== "all") {
      yearMatch = overlapsPeriod(
        item,
        `${selectedYear}-01-01`,
        `${selectedYear}-12-31`
      );
    }

    if (selectedMonth !== "all") {
      monthMatch = matchesMonth(item, selectedMonth, selectedYear);
    }

    const memberMatch =
      selectedMember === "all" ||
      getMembers(item).includes(selectedMember);

    return yearMatch && monthMatch && memberMatch;
  });

  pastCount.textContent = `${filteredSchedules.length}개 일정`;
  pastScheduleList.innerHTML = "";

  if (filteredSchedules.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-schedule";
    empty.textContent = "등록된 지난 일정이 없습니다.";
    pastScheduleList.appendChild(empty);
    return;
  }

  filteredSchedules.forEach(item => {
    pastScheduleList.appendChild(createScheduleArticle(item));
  });
}

// 필터 이벤트
yearFilter.addEventListener("change", renderPastSchedules);
monthFilter.addEventListener("change", renderPastSchedules);
memberFilter.addEventListener("change", renderPastSchedules);

// 초기 실행
renderPastSchedules();

console.log("PAST SCHEDULE 실행 완료");
