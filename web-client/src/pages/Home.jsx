import React, { useEffect, useState } from "react";
import Help from '../components/Help';
import '../style/HomeStyle.css';
import VisitedPlaces from "../components/VisitedPlaces";
import Axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/userSlice';

function Home() {
  // const [user, setUser] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [foundInTop , setFoundInTop ] = useState(false);
  const [geminiSuggestion, setGeminiSuggestion] = useState("Зареждане...");
  const [geminiCitat, setGeminiCitat] = useState("Зареждане...");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const userSession = localStorage.getItem("userSession");
  //   if (userSession) {
  //     setUser(JSON.parse(userSession));
  //   }
  // }, []);

  useEffect(() => {
    if (user?.firstLogin) {
      setHelpOpen(true);

      const fetchData = async () => {
        try {
          await Axios.put(`${backendUrl}/users/updateField`, {
            id: user.id,
            field: "firstLogin",
            newValue: false,
          });
          const updatedUser = { ...user, firstLogin: false };
          // localStorage.setItem("userSession", JSON.stringify(user));
          dispatch(loginSuccess(updatedUser));
        } catch (error) {
          console.error("Error updating user field:", error);
        }
      };

      fetchData();
    }

    if (user) {
      fetchPlaces();
      fetchTopUsers();
      askGemini();
      getCitat();
    }
  }, [user]);

  const fetchTopUsers = async () => {
    try {
      const response = await Axios.get(`${backendUrl}/users/getTopUsers`);
      
      if (response.data.success) {
        let topUsers = response.data.topUsers;
        let foundInTop = false;
  
        topUsers.forEach((u, i) => {
          if (u._id === user.id) {
            topUsers[i] = {
              ...u,
              me: true
            };
            foundInTop = true;
          }
        });
        setTopUsers(topUsers);
        setFoundInTop(foundInTop);
  
      } else {
        console.error("Failed to fetch top users");
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  };
  

  const getCitat = async () => {
    try {
      const prompt = "Дай ми цитат за деня, свързан с красотата на българия и туристическите ѝ дестинации. Но без обяснения, само цитат, защото го ползвам да го показвам на потребители!";

      const res = await Axios.post(`${backendUrl}/google/gemini`, { prompt });
      if (res.data.response) {
        setGeminiCitat(res.data.response);
      } else {
        console.error("Не е намерен отговор от модела.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  function getCurrentSeason() {
    const today = new Date();
    const month = today.getMonth() + 1; // Месеци се броят от 0 до 11, затова добавяме 1
    const day = today.getDate();
  
    if ((month === 3 && day >= 21) || (month > 3 && month < 6) || (month === 6 && day <= 20)) {
      return 'Пролет';
    } else if ((month === 6 && day >= 21) || (month > 6 && month < 9) || (month === 9 && day <= 20)) {
      return 'Лято';
    } else if ((month === 9 && day >= 21) || (month > 9 && month < 12) || (month === 12 && day <= 20)) {
      return 'Есен';
    } else {
      return 'Зима';
    }
  }

  const askGemini = async () => {
    try {
      const prompt = "Кое е най-хубавото място в България, което да посетя през "+ getCurrentSeason() +"? Искам конкретно място и описание защо да посетя него. Максимум 4-5 изречения! Можеш да даваш идеи от цяла България, дори да се фокусираш въру почти забравени дестинации, за да се популизират пак! СЪЩО ТАКА ОТГОВОРА ТИ ГО СЛАГАМ НА СТРАНИЦА, ПРОСТО УВАЖИТЕЛЕН ОТГОВОР, КАТО ЗА ПОТРЕБИТЕЛИ, МОЛЯ!";

      const res = await Axios.post(`${backendUrl}/google/gemini`, { prompt });
      if (res.data.response) {
        setGeminiSuggestion(res.data.response);
      } else {
        console.error("Не е намерен отговор от модела.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const fetchPlaces = async () => {
    const response = await Axios.get(`${backendUrl}/places/getUserPlaces`, {
      params: { userId: user.id, visited: true }
    });
    
    setVisitedPlaces(response.data.sort((a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)));
  }

  // const formatDate = (date) => {
  //   const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  //   return new Date(date).toLocaleDateString('bg-BG', options);
  // };

  return (
    <div className="page-style">
      {helpOpen && (
        <div className="help-modal-overlay" onClick={() => setHelpOpen(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Помощ и Често Задавани Въпроси</h2>
              <button className="close-button" onClick={() => setHelpOpen(false)}>✕</button>
            </div>
            <Help />
          </div>
        </div>
      )}

      <center>
        <h1>Добре дошли, {user?.name ? user?.name : "гост"}!</h1>
      </center>

      <center>
        <p><i>{geminiCitat}</i></p>
      </center>

      <div className="home-content">
        <div className="visited-places"><VisitedPlaces visitedPlaces={visitedPlaces} /></div>

        <aside className="right-widgets">
        <div className="points-widget widget-box">
  <h3>Вашите точки: {user?.points ?? 0}</h3>
  <ul>
    {topUsers.map((u, idx) => {
      let rankClass = "rank-box";
      if (idx === 0) rankClass += " rank-gold"; // Първо място - златно
      else if (idx === 1) rankClass += " rank-silver"; // Второ място - сребърно
      else if (idx === 2) rankClass += " rank-bronze"; // Трето място - бронзово

      if (u.me) rankClass += " rank-user"; // Ако потребителят е текущия, да има стил за 'rank-user'

      return (
        <li key={idx} className={rankClass}>
          {u.name} — {u.points} т.
        </li>
      );
    })}
  </ul>

  {!foundInTop && (
    <p className="rank-box rank-user">
      {user?.name} — {user?.points} т.
    </p>
  )}
</div>


          <div className="gemini-widget widget-box">
            <h4>Gemini Бот: Препоръка</h4>
            <p>{geminiSuggestion}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
