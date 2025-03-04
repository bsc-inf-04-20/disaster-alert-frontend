import EventCard from "./eventCard";

type LinkedEventProps = {
    events:Event[]
    setCurrentDisaster:Function
    currentEvent :Event
}

type Event ={
    id: number,
    type: string,
    name: string,
    date: string,
    intensity: number,
    impact_chance: number
}

const LinkedEvents = ({events, setCurrentDisaster, currentEvent}: LinkedEventProps) => {
  return (
    <div className="relative flex flex-col items-center gap-6  justify-center">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex items-center w-full">
          {/* Vertical Line */}
          {index !== 0 && (
            <div className="absolute left-1/2 w-1 bg-gray-300 h-10 -top-10"></div>
          )}

          {/* Event Card */}
          <EventCard event={event} setCurrentDisaster={setCurrentDisaster} currentEvent= {currentEvent}/>
        </div>
      ))}
    </div>
  );
};

export default LinkedEvents;
