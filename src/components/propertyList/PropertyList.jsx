import useFetch from "../../hooks/useFetch";
import "./propertyList.css"
import { useNavigate } from "react-router-dom";

const PropertyList = () => {
  const { data, loading, error } = useFetch("/hotels/countByType");
  const navigate = useNavigate();

  // Default dates: today and tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const defaultDates = [
    {
      startDate: today,
      endDate: tomorrow,
      key: "selection"
    }
  ];
  const defaultOptions = {
    adult: 1,
    children: 0,
    room: 1
  };

  const images = [
    "https://r-xx.bstatic.com/xdata/images/hotel/263x210/595550862.jpeg?k=3514aa4abb76a6d19df104cb307b78b841ac0676967f24f4b860d289d55d3964&o=",
    "https://r-xx.bstatic.com/xdata/images/hotel/263x210/595548591.jpeg?k=01741bc3aef1a5233dd33794dda397083092c0215b153915f27ea489468e57a2&o=",
    "https://r-xx.bstatic.com/xdata/images/hotel/263x210/595551044.jpeg?k=262826efe8e21a0868105c01bf7113ed94de28492ee370f4225f00d1de0c6c44&o=",
    "https://q-xx.bstatic.com/xdata/images/hotel/263x210/595550178.jpeg?k=1db9bffadd03a0f2a9f0a06ba6c7751b16465f2dd251738f229d7a57dca799ef&o=",
    "https://q-xx.bstatic.com/xdata/images/hotel/263x210/595550415.jpeg?k=8967853a074040381dfa25a568e6c780e309b529e0c144995c5bbc9644721eca&o="
  ];

  const handleTypeClick = (type) => {
    navigate("/hotels", {
      state: {
        destination: "",
        type: type,
        date: defaultDates,
        options: defaultOptions
      }
    });
  };

  return (
    <div className="pList">
      {loading ? (
        "loading"
      ) : (
        <>
          {data &&
            images.map((img, i) => (
              <div className="pListItem" key={i} onClick={() => handleTypeClick(data[i]?.type)} style={{ cursor: "pointer" }}>
                <img
                  src={img}
                  alt=""
                  className="pListImg"
                />
                <div className="pListTitles">
                  <h1>{data[i]?.type || "Hotel Type"}</h1>
                  <h2>{data[i]?.count || "0"} {data[i]?.type || "hotels"}</h2>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default PropertyList;