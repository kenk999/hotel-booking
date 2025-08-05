import { useState,useEffect } from "react"
import axios from "axios"


function useFetch(url){
    const [data,setData]=useState([])
     const [loading,setLoading]=useState(false)
      const [error,setError]=useState(false)


useEffect(
    function(){
        // Only fetch if URL is provided and not null
        if (!url) {
            setData([]);
            setLoading(false);
            return;
        }
        
        const fetchData=async function(){
            setLoading(true)
            setError(false) // Reset error state
            try{
                const res=await axios.get(url);
                setData(res.data);
            }catch(err){
                setError(err)
            }
            setLoading(false)
        }
        fetchData();
    },[url]
)





  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;