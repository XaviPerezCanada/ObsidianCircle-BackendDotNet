import { useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; 
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { RightOutlined, LeftOutlined } from '@ant-design/icons';


dayjs.locale('es');
const localizer = dayjsLocalizer(dayjs);


const myEventsList = [
  {
    title: 'Reunión de equipo',
    start: new Date(2026, 0, 15, 10, 0), 
    end: new Date(2026, 0, 15, 11, 30), 
  },
  {
    title: 'Almuerzo',
    start: new Date(2024, 0, 15, 14, 0), 
    end: new Date(2024, 0, 15, 15, 0), 
  },
];

const Agenda = () => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  return (
    <>
      <style>{`
        .rbc-today {
          background-color: #2a2a2a !important;
        }
        .rbc-current-time-indicator {
          background-color: #4a4a4a;
        }
        .rbc-off-range-bg {
          background-color: #1a1a1a;
        }
        .rbc-day-bg.rbc-today {
          background-color:rgb(49, 54, 48) !important;
        }
        .rbc-time-slot.rbc-today {
          background-color: #2a2a2a !important;
        }
        /* Hover effect para las casillas de los días en vista mensual */
        .rbc-month-view .rbc-day-bg {
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        .rbc-month-view .rbc-day-bg:hover {
          background-color: #353535 !important;
        }
        .rbc-month-view .rbc-day-bg.rbc-today:hover {
          background-color: #3a3a3a !important;
        }
        .rbc-month-view .rbc-day-bg.rbc-off-range-bg:hover {
          background-color: #252525 !important;
        }
      
      `}</style>
      <div className="w-[60%] h-[75%] p-4 bg-[#1F1F1F] rounded-lg shadow-md">
        <Calendar
          localizer={localizer}
          events={myEventsList}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day"]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          style={{ height: '100%' }}
          messages={{
            next: <RightOutlined />,
            previous: <LeftOutlined />,
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Sin eventos",
          }}
        />
      </div>
    </>
  );
};

export default Agenda;