import  Agenda  from "../components/agenda/Agenda";
//import  ListEvents  from "../components/listEvents/ListEvents";

export const Home = () => {
  return (
    
    <div className="flex flex-col w-full h-full gap-4">
        <h1 className="text-2xl font-bold">Zona de Reservas</h1>
        <div className="flex flex-row w-full h-full gap-4">
      <Agenda />
    {/* <ListEvents /> */}
    </div>
       
    </div>
  );
};