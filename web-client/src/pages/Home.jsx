import React, { useEffect, useState } from "react";
import Help from '../components/Help';
import '../style/HomeStyle.css';
import Axios from "axios";

function Home({ setIsAuthenticated }) {
  const [user, setUser] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // 🔥 Нови състояния
  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [foundInTop , setFoundInTop ] = useState(false);
  const [geminiSuggestion, setGeminiSuggestion] = useState("Зареждане...");
  const [geminiCitat, setGeminiCitat] = useState("Зареждане...");

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  useEffect(() => {
    if (user?.firstLogin) {
      setHelpOpen(true);

      const fetchData = async () => {
        try {
          await Axios.put(`http://${host}:${port}/users/updateField`, {
            id: user.id,
            field: "firstLogin",
            newValue: false,
          });
          user.firstLogin = false;
          localStorage.setItem("userSession", JSON.stringify(user));
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
  }, [user, host, port]);

  const fetchTopUsers = async () => {
    try {
      const response = await Axios.get(`http://${host}:${port}/users/getTopUsers`);
      
      if (response.data.success) {
        let topUsers = response.data.topUsers;
        console.log("topUsers: ", topUsers);
        let foundInTop = false;
  
        console.log("user: ", user);
        topUsers.forEach((u, i) => {
          if (u._id === user.id) {
            console.log('u._id === user._id: ', u._id === user._id);
            topUsers[i] = {
              ...u,
              me: true
            };
            foundInTop = true;
          }
        });
  
        console.log('topUsers 2: ', topUsers);
        console.log('foundInTop 2: ', foundInTop);
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

      const res = await Axios.post(`http://${host}:${port}/google/gemini`, { prompt });
      console.log("response from gemini: ", res);
      if (res.data.response) {
        setGeminiCitat(res.data.response);
      } else {
        //setError("Не е намерен отговор от модела.");
        console.error("Не е намерен отговор от модела.");
      }
    } catch (error) {
      //setError("Грешка при заявката към Gemini.");
      console.error(error);
    } finally {
      //setLoading(false);
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
      const prompt = "ИСКАМ РАЗЛИЧНИ ДЕСТИНАЦИИ, ТИ ДИ ДАВАШ ЕДНО И СЪЩО, ПРЕСТАНИ БЕ! СТИГА С ТОВ АСЕЛО КОВАЧЕВИЦА, ДАЙ МИ НЕЩО ДРУГО, НЕ Е ДНО И СЪЩО... Кое е най-хубавото място в България, което да посетя през "+ getCurrentSeason() +"? Искам конкретно място и описание защо да посетя него. Максимум 4-5 изречения! Можеш да даваш идеи от цяла България, дори да се фокусираш въру почти забравени дестинации, за да се популизират пак! СЪЩО ТАКА ОТГОВОРА ТИ ГО СЛАГАМ НА СТРАНИЦА, БЕЗ ИЗВИНЕНИЯ, БЕЗ НИЩО, ПРОСТО УВАЖИТЕЛЕН ОТГОВОР, КАТО ЗА ПОТРЕБИТЕЛИ, МОЛЯ!";

      const res = await Axios.post(`http://${host}:${port}/google/gemini`, { prompt });
      console.log("response from gemini: ", res);
      if (res.data.response) {
        setGeminiSuggestion(res.data.response);
      } else {
        //setError("Не е намерен отговор от модела.");
        console.error("Не е намерен отговор от модела.");
      }
    } catch (error) {
      //setError("Грешка при заявката към Gemini.");
      console.error(error);
    } finally {
      //setLoading(false);
    }
  }

  const fetchPlaces = async () => {
    const response = await Axios.get("http://"+host+":"+port+"/places/getUserPlaces", {
      params: { userId: user.id, visited: true }
    });
    
    setVisitedPlaces(response.data.sort((a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)));
  }

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('bg-BG', options);
  };

  return (
    <div className="home-container">
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
        <p>{geminiCitat}</p>
      </center>

      {/* 💡 Новата част */}
      <div className="home-content">
        <section className="visited-places">
          <h2>Посетени места</h2>
          <div className="visited-places-list">
            {visitedPlaces.map((place, idx) => (
              <div className="visited-place-item" key={idx}>
                <div className="visited-place-name">{place.name}</div>
                <div className="visited-place-date">{formatDate(place.dateOfVisit)}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="right-widgets">
          <div className="points-widget">
            <h3>Вашите точки: {user?.points ?? 0}</h3>
            <h4>Класация</h4>
            <ol>
              {topUsers.map((u, idx) => (
                <li key={idx}>
                  {u.me ? (
                    <b>{u.name} — {u.points} т.</b>
                  ) : (
                    `${u.name} — ${u.points} т.`
                  )}
                </li>
              ))}
            </ol>
            {!foundInTop && <p><b>{user?.name} — {user?.points} т.</b></p>}
          </div>

          <div className="gemini-widget">
            <h4>Gemini Бот: Препоръка</h4>
            <p>{geminiSuggestion}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
