import { useNavigate, useParams } from "react-router-dom";
import TicketCard from "../components/utils/TicketCard";
import { IoScanCircleSharp } from "react-icons/io5";

const BookingPage = () => {
  const navigate = useNavigate();
  const { busId } = useParams();

  return (
    <div className="content flex flex-col">
      <TicketCard />
      <button
        className="app-btn flex gap-2 max-w-fit mx-auto mb-20"
        onClick={() => navigate(`/scanner/${busId}`)}
      >
        Scan Next Passenger <IoScanCircleSharp className="text-2xl" />{" "}
      </button>
    </div>
  );
};

export default BookingPage;
