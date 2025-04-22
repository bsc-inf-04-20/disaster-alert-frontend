import { motion } from "framer-motion";
import { ReplaceUnderScoreMakeCamelCase } from "../utils/textFormatting";

type Event ={
    id: number,
    type: string,
    name: string,
    date: string,
    intensity: number,
    impact_chance: number
}

const EventCard = ({ event, setCurrentDisaster, currentEvent }: { event: any, setCurrentDisaster: Function, currentEvent:Event }) => {
  return (
    <motion.div
      className={`p-4 rounded-lg shadow-lg border-l-4 w-full text-center  ${ currentEvent.name==event.name?'bg-blue-200 ':'bg-white'}`}
      whileHover={{ scale: 1.05 }}
      onClick={()=>setCurrentDisaster(event)}
    >
      <span className="text-base font-extrabold">{event.name}</span>
      <h3 className="text-sm ">Disaster type: {event.eventType}</h3>
      <p className="text-sm">{new Date(event.startDate).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</p>
    </motion.div>
  );
};

export default EventCard;
