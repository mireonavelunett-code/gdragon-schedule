
import { schedules } from "./data.js";

// =========================
// DOM 요소
// =========================

const calendarGrid = document.getElementById("calendar-grid");
const currentMonth = document.getElementById("current-month");
const scheduleList = document.getElementById("schedule-list");
const selectedDateTitle = document.getElementById("selected-date");

const prevButton = document.getElementById("prev-month");
const nextButton = document.getElementById("next-month");

const totalCount = document.getElementById("total-count");
const upcomingCount = document.getElementById("upcoming-count");
const pastCount = document.getElementById("past-count");

const artistFilter = document.getElementById("artist-filter");


// =========================
// 날짜 설정
// =========================

const today = new Date();

let currentYear = today.getFullYear();
let currentMonthIndex = today.getMonth();

let selectedDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatKoreanDate(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

const todayString = formatDate(today);


// =========================
// 기간 일정 처리
// =========================

function getEndDate(item) {
  return item.endDate || item.date;
}

function isScheduleOnDate(item, dateString) {
  return item.date <= dateString &&
         getEndDate(item) >= dateString;
}

function getDateLabel(item) {
  if (!item.endDate || item.endDate === item.date) {
    return item.date;
  }

  return `${item.date} ~ ${item.endDate}`;
}

// YYYY-MM-DD 문자열을 날짜 객체로 변환
function toDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

// 두 날짜 사이의 일수 계산
function daysBetween(start, end) {
  return Math.round(
    (toDate(end) - toDate(start)) / (1000 * 60 * 60 * 24)
  );
}

// 날짜 문자열 중 가장 늦은 날짜
function maxDate(...dates) {
  return dates.reduce((a, b) => a > b ? a : b);
}

// 날짜 문자열 중 가장 빠른 날짜
function minDate(...dates) {
  return dates.reduce((a, b) => a < b ? a : b);
}


// =========================
// 아티스트 처리
// =========================

// 단일 멤버와 복수 멤버 모두 지원
function getMembers(item) {
  if (!item.member) return [];

  return Array.isArray(item.member)
    ? item.member
    : [item.member];
}

// 선택한 아티스트 확인
function matchesArtist(item) {
  const selectedArtist = artistFilter?.value || "all";

  return selectedArtist === "all" ||
    getMembers(item).includes(selectedArtist);
}

// 필터 적용 일정
function getFilteredSchedules() {
  return schedules.filter(matchesArtist);
}


// =========================
// 카테고리 색상 처리
// =========================

function getCategoryClass(category) {
  const categoryMap = {
    "공연": "category-performance",
    "방송": "category-broadcast",
    "행사": "category-event",
    "전시": "category-exhibition",
    "음원 발매": "category-release"
  };

  return categoryMap[category] || "category-other";
}


// =========================
// 일정 통계
// =========================

function updateSummary() {
  const filteredSchedules = getFilteredSchedules();

  const upcoming = filteredSchedules.filter(
    item => getEndDate(item) >= todayString
  );

  const past = filteredSchedules.filter(
    item => getEndDate(item) < todayString
  );

  if (totalCount) {
    totalCount.textContent = filteredSchedules.length;
  }

  if (upcomingCount) {
    upcomingCount.textContent = upcoming.length;
  }

  if (pastCount) {
    pastCount.textContent = past.length;
  }
}


// =========================
// 달력 생성
// =========================

function renderCalendar() {
  if (!calendarGrid || !currentMonth) return;

  calendarGrid.innerHTML = "";

  currentMonth.textContent =
    `${currentYear}년 ${currentMonthIndex + 1}월`;

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  // -------------------------
  // 요일 헤더
  // -------------------------

  const weekdayRow = document.createElement("div");

  weekdayRow.className = "calendar-weekdays";

  weekdays.forEach(day => {
    const cell = document.createElement("div");

    cell.className = "calendar-day weekday";
    cell.textContent = day;

    weekdayRow.appendChild(cell);
  });

  calendarGrid.appendChild(weekdayRow);


  // -------------------------
  // 달력 날짜 계산
  // -------------------------

  const firstDay = new Date(
    currentYear,
    currentMonthIndex,
    1
  ).getDay();

  const lastDate = new Date(
    currentYear,
    currentMonthIndex + 1,
    0
  ).getDate();

  const monthStart = formatDate(
    new Date(currentYear, currentMonthIndex, 1)
  );

  const monthEnd = formatDate(
    new Date(currentYear, currentMonthIndex, lastDate)
  );

  const totalWeeks = Math.ceil(
    (firstDay + lastDate) / 7
  );

  const filteredSchedules = getFilteredSchedules();


  // =========================
  // 주 단위 달력 생성
  // =========================

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {

    const week = document.createElement("div");

    week.className = "calendar-week";


    // 해당 주의 시작일과 종료일
    const weekStartDate = new Date(
      currentYear,
      currentMonthIndex,
      1 + weekIndex * 7 - firstDay
    );

    const weekEndDate = new Date(
      weekStartDate.getFullYear(),
      weekStartDate.getMonth(),
      weekStartDate.getDate() + 6
    );

    const weekStartString = formatDate(weekStartDate);
    const weekEndString = formatDate(weekEndDate);


    // -------------------------
    // 날짜 칸 생성
    // -------------------------

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {

      const date = new Date(
        weekStartDate.getFullYear(),
        weekStartDate.getMonth(),
        weekStartDate.getDate() + dayIndex
      );

      const dateString = formatDate(date);

      const cell = document.createElement("div");

      cell.style.gridColumn = String(dayIndex + 1);
      cell.style.gridRow = "1";


      // 현재 달이 아닌 날짜
      if (date.getMonth() !== currentMonthIndex) {

        cell.className = "calendar-day empty";

        week.appendChild(cell);

        continue;
      }


      cell.className = "calendar-day";


      // 날짜 숫자
      const dateNumber = document.createElement("span");

      dateNumber.className = "date";
      dateNumber.textContent = date.getDate();

      cell.appendChild(dateNumber);


      // 오늘 표시
      if (dateString === todayString) {
        cell.classList.add("today");
      }


      // 선택한 날짜 표시
      if (dateString === formatDate(selectedDate)) {
        cell.classList.add("selected");
      }


      // 날짜 클릭
      cell.addEventListener("click", () => {

        selectedDate = date;

        renderCalendar();
        renderSelectedSchedule();

      });

      week.appendChild(cell);
    }


    // =========================
    // 해당 주의 일정 검색
    // =========================

    const weekSchedules = filteredSchedules
      .filter(item => {

        return (
          item.date <= weekEndString &&
          getEndDate(item) >= weekStartString &&
          item.date <= monthEnd &&
          getEndDate(item) >= monthStart
        );

      })
      .sort((a, b) => {

        // 시작일이 빠른 일정 우선
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }

        // 시작일이 같으면 기간이 긴 일정 우선
        return getEndDate(b).localeCompare(getEndDate(a));

      });


    // =========================
    // 일정 막대 행 배정
    // =========================

    const laneEnds = [];

    weekSchedules.forEach(item => {

      // 이번 주에 표시할 일정 시작일
      const visibleStart = maxDate(
        item.date,
        weekStartString,
        monthStart
      );

      // 이번 주에 표시할 일정 종료일
      const visibleEnd = minDate(
        getEndDate(item),
        weekEndString,
        monthEnd
      );


      // 시작 열과 종료 열
      const startColumn =
        daysBetween(weekStartString, visibleStart) + 1;

      const endColumn =
        daysBetween(weekStartString, visibleEnd) + 1;


      // 겹치지 않는 행 찾기
      let lane = laneEnds.findIndex(
        lastColumn => lastColumn < startColumn
      );

      if (lane === -1) {
        lane = laneEnds.length;
      }

      laneEnds[lane] = endColumn;


      // =========================
      // 일정 막대 생성
      // =========================

      const bar = document.createElement("div");

      bar.className =
        `calendar-event-bar ${getCategoryClass(item.category)}`;

      bar.style.gridColumn =
        `${startColumn} / ${endColumn + 1}`;

      bar.style.gridRow = String(lane + 2);


      // 실제 시작일인지 확인
      const startsHere =
        item.date >= weekStartString &&
        item.date >= monthStart;


      // 실제 종료일인지 확인
      const endsHere =
        getEndDate(item) <= weekEndString &&
        getEndDate(item) <= monthEnd;


      if (startsHere) {
        bar.classList.add("is-start");
      }

      if (endsHere) {
        bar.classList.add("is-end");
      }

      // 하루짜리 일정
      if (item.date === getEndDate(item)) {
        bar.classList.add("is-single");
      }


      // 일정 제목
      bar.textContent = item.title;

      bar.title =
        `${item.title} (${getDateLabel(item)})`;


      // 일정 막대 클릭
      bar.addEventListener("click", event => {

        event.stopPropagation();

        const targetDate = startsHere
          ? item.date
          : visibleStart;

        selectedDate = toDate(targetDate);

        renderCalendar();
        renderSelectedSchedule();

      });


      week.appendChild(bar);

    });


    // 일정 개수에 따라 주 높이 조정
    week.style.setProperty(
      "--event-lanes",
      Math.max(laneEnds.length, 1)
    );


    calendarGrid.appendChild(week);

  }

}


// =========================
// 선택한 날짜의 일정
// =========================

function renderSelectedSchedule() {

  if (!scheduleList || !selectedDateTitle) return;

  const dateString = formatDate(selectedDate);

  selectedDateTitle.textContent =
    formatKoreanDate(selectedDate);

  scheduleList.innerHTML = "";


  // 해당 날짜의 일정 검색
  const selectedSchedules = getFilteredSchedules()
    .filter(item => isScheduleOnDate(item, dateString))
    .sort((a, b) => {

      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return (a.time || "").localeCompare(b.time || "");

    });


  // 일정이 없는 경우
  if (selectedSchedules.length === 0) {

    const empty = document.createElement("p");

    empty.className = "empty-schedule";
    empty.textContent = "등록된 일정이 없습니다.";

    scheduleList.appendChild(empty);

    return;
  }


  // =========================
  // 일정 카드 생성
  // =========================

  selectedSchedules.forEach(item => {

    const article = document.createElement("article");

    article.className =
      `selected-schedule-item ${getCategoryClass(item.category)}`;


    // -------------------------
    // 일정 상단 정보
    // -------------------------

    const top = document.createElement("div");

    top.className = "selected-schedule-top";


    const date = document.createElement("span");

    date.className = "selected-schedule-date";
    date.textContent = getDateLabel(item);


    const time = document.createElement("span");

    time.className = "selected-schedule-time";
    time.textContent = item.time || "시간 미정";

    top.append(date, time);


    // -------------------------
    // 일정 제목
    // -------------------------

    const title = document.createElement("h3");

    title.className = "selected-schedule-title";
    title.textContent = item.title;


    // -------------------------
    // 아티스트 및 장소
    // -------------------------

    const metaParts = [
      getMembers(item).join(" · "),
      item.location
    ].filter(Boolean);


    const meta = document.createElement("p");

    meta.className = "selected-schedule-meta";
    meta.textContent = metaParts.join(" · ");


    // -------------------------
    // 하단 정보
    // -------------------------

    const footer = document.createElement("div");

    footer.className = "selected-schedule-footer";


    // 카테고리
    if (item.category) {

      const category = document.createElement("span");

      category.className =
        `selected-schedule-category ${getCategoryClass(item.category)}`;

      category.textContent = item.category;

      footer.appendChild(category);

    }


    // -------------------------
    // 공식 출처
    // -------------------------

    if (item.source) {

      const sources = Array.isArray(item.source)
        ? item.source
        : [item.source];

      sources.forEach((url, sourceIndex) => {

        if (!url) return;

        const source = document.createElement("a");

        source.href = url;
        source.target = "_blank";
        source.rel = "noopener noreferrer";

        source.className = "selected-schedule-source";

        source.textContent = sources.length > 1
          ? `출처 ${sourceIndex + 1} ↗`
          : "공식 출처 ↗";

        footer.appendChild(source);

      });

    }


    // -------------------------
    // 카드 조립
    // -------------------------

    article.append(top, title);

    if (meta.textContent) {
      article.appendChild(meta);
    }

    if (footer.children.length > 0) {
      article.appendChild(footer);
    }

    scheduleList.appendChild(article);

  });

}


// =========================
// 아티스트 필터 이벤트
// =========================

if (artistFilter) {

  artistFilter.addEventListener("change", () => {

    updateSummary();
    renderCalendar();
    renderSelectedSchedule();

  });

}


// =========================
// 이전 달
// =========================

if (prevButton) {

  prevButton.addEventListener("click", () => {

    currentMonthIndex--;

    if (currentMonthIndex < 0) {
      currentMonthIndex = 11;
      currentYear--;
    }

    selectedDate = new Date(
      currentYear,
      currentMonthIndex,
      1
    );

    renderCalendar();
    renderSelectedSchedule();

  });

}


// =========================
// 다음 달
// =========================

if (nextButton) {

  nextButton.addEventListener("click", () => {

    currentMonthIndex++;

    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear++;
    }

    selectedDate = new Date(
      currentYear,
      currentMonthIndex,
      1
    );

    renderCalendar();
    renderSelectedSchedule();

  });

}


// =========================
// 초기 실행
// =========================

updateSummary();

renderCalendar();

renderSelectedSchedule();

console.log("G-DRAGON SCHEDULE 실행 완료");
