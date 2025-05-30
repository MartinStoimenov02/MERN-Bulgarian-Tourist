import React, { useState } from 'react';
import '../style/WorkTimeTable.css'; 

// Превод на дните на седмицата на български
const daysTranslation = {
  'Monday': 'Понеделник',
  'Tuesday': 'Вторник',
  'Wednesday': 'Сряда',
  'Thursday': 'Четвъртък',
  'Friday': 'Петък',
  'Saturday': 'Събота',
  'Sunday': 'Неделя'
};

// Превод на заглавията на колоните
const headersTranslation = {
  'bg': {
    'day': 'Ден',
    'time': 'Работно време'
  },
  'en': {
    'day': 'Day',
    'time': 'Working Hours'
  }
};

// Превод за "Open 24 hours" и "Closed"
const statusTranslation = {
  'bg': {
    'open24': 'Отворено 24 часа',
    'closed': 'Затворено'
  },
  'en': {
    'open24': 'Open 24 hours',
    'closed': 'Closed'
  }
};

// Функция за премахване на специални символи от часовете
function cleanTimeString(time) {
  return time.replace(/\u202F|\u2009/g, '').trim();
}

// Функция за преобразуване на времето в 24-часов формат
function convertTo24HourFormat(time) {
  if (time.toLowerCase() === 'closed') return time;
  if (time.toLowerCase() === 'open 24 hours') return time;

  time = cleanTimeString(time);

  let [hour, minute] = time.split(":");
  minute = minute.slice(0, 2);
  const period = time.toUpperCase().includes("AM") ? "AM" : "PM";

  let newHour = parseInt(hour, 10);

  if (period === "AM" && newHour === 12) {
    newHour = 0;
  } else if (period === "PM" && newHour !== 12) {
    newHour += 12;
  }

  return `${newHour.toString().padStart(2, '0')}:${minute}`;
}

// Функция за обработване на времевия интервал
function parseTimeRanges(timeString) {
  timeString = cleanTimeString(timeString);

  if (timeString.toLowerCase() === 'closed') {
    return [{ startTime: 'Closed', endTime: 'Closed' }];
  }
  if (timeString.toLowerCase() === 'open 24 hours') {
    return [{ startTime: 'Open 24 hours', endTime: 'Open 24 hours' }];
  }

  const ranges = timeString.split(",").map(range => {
    const parts = range.split("–").map(part => part.trim());
    if (parts.length === 2) {
      return { startTime: parts[0], endTime: parts[1] };
    }
    return { startTime: range, endTime: range };
  });

  return ranges;
}

const WorkTimeTable = ({ workTime }) => {
  const [language, setLanguage] = useState('bg');

  return (
    <div>
<table className="work-time-table">
  <thead>
    <tr>
      <th>{headersTranslation[language].day}</th>
      <th>{headersTranslation[language].time}</th>
    </tr>
  </thead>
  <tbody>
    {workTime.map((item, index) => {
      const [day, time] = item.split(": ");
      if (!time) {
        return (
          <tr key={index}>
            <td colSpan={2}>Няма информация</td>
          </tr>
        );
      }

      const timeRanges = parseTimeRanges(time);
      const translatedDay = language === 'bg' ? daysTranslation[day] : day;

      return (
        <tr key={index}>
          <td>{translatedDay}</td>
          <td>
            {timeRanges.map((range, idx) => {
              const startFormatted = range.startTime === 'Closed' 
                ? statusTranslation[language].closed 
                : range.startTime === 'Open 24 hours' 
                ? statusTranslation[language].open24 
                : language === 'bg' 
                ? convertTo24HourFormat(range.startTime) 
                : range.startTime;

              const endFormatted = range.endTime === 'Closed' 
                ? statusTranslation[language].closed 
                : range.endTime === 'Open 24 hours' 
                ? statusTranslation[language].open24 
                : language === 'bg' 
                ? convertTo24HourFormat(range.endTime) 
                : range.endTime;

              if (startFormatted === statusTranslation[language].closed && endFormatted === statusTranslation[language].closed) {
                return <div key={idx}>{statusTranslation[language].closed}</div>;
              }

              return (
                <div key={idx}>
                  {startFormatted === endFormatted ? startFormatted : `${startFormatted} – ${endFormatted}`}
                </div>
              );
            })}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
    </div>
  );
};

export default WorkTimeTable;
