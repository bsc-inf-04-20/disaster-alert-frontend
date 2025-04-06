import { motion } from "framer-motion";

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
      className={`p-4 rounded-lg shadow-lg border-l-4 w-full text-center  ${ currentEvent.metadata.disasterName==event.metadata.disasterName?'bg-blue-200 ':'bg-white'}`}
      whileHover={{ scale: 1.05 }}
      onClick={()=>setCurrentDisaster(event.metadata.disasterName)}
    >
      <span className="text-xl font-bold">{event.metadata.disasterName}</span>
      <h3 className="text-lg font-bold">{event.metadata.disasterType}</h3>
      <p className="text-sm">{new Date(event.metadata.startDate).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</p>
    </motion.div>
  );
};

export default EventCard;
