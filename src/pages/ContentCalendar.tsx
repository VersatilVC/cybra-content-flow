
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const ContentCalendar = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const calendarEvents = [
    {
      id: 1,
      title: "AI Cybersecurity Blog",
      date: 15,
      type: "blog",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Government Guide Release",
      date: 22,
      type: "guide",
      status: "draft"
    },
    {
      id: 3,
      title: "Social Media Post Series",
      date: 28,
      type: "social",
      status: "approved"
    }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-purple-100 text-purple-800';
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate calendar days (simplified for demo)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Calendar</h1>
          <p className="text-gray-600">Plan and schedule your content publishing</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Schedule Content
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{currentMonth}</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((day, index) => (
              <div key={index} className="min-h-[100px] border border-gray-200 rounded-lg p-2">
                {day && (
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                    {calendarEvents
                      .filter(event => event.date === day)
                      .map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded mb-1 ${getEventColor(event.type)}`}
                        >
                          {event.title}
                        </div>
                      ))
                    }
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Content</h3>
        <div className="space-y-3">
          {calendarEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600">Scheduled for {currentMonth.split(' ')[0]} {event.date}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                {event.type}
              </span>
              <span className="text-sm text-gray-500">{event.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentCalendar;
