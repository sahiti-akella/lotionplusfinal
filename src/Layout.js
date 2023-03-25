import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import NoteList from "./NoteList";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "./utils";
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';


const localStorageKey = "lotion-v1";


function Layout() {
 const navigate = useNavigate();
 const mainContainerRef = useRef(null);
 const [collapse, setCollapse] = useState(false);
 const [notes, setNotes] = useState([]);
 const [editMode, setEditMode] = useState(false);
 const [currentNote, setCurrentNote] = useState(-1);
 const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null); //adding local storage to user so you stay signed in when page is refreshed
 const [profile, setProfile] = useState(null);


 const login = useGoogleLogin({
   onSuccess: (codeResponse) => {
     localStorage.setItem('user', JSON.stringify(codeResponse));
     setUser(codeResponse);
   },
   onError: (error) => console.log('Login Failed:', error),
 });


 useEffect(() => {
   if (user) {
     axios
       .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
         headers: {
           Authorization: `Bearer ${user.access_token}`,
           Accept: 'application/json',
         },
       })
       .then((res) => {
         setProfile(res.data);
       })
       .catch((err) => console.log(err));
   }
 }, [user]);


 const logOut = () => {
   localStorage.removeItem('user'); //removing user login from local storage when signed out
   googleLogout();
   setProfile(null);
   setUser(null);
 };


 useEffect(() => {
   const height = mainContainerRef.current.offsetHeight;
   mainContainerRef.current.style.maxHeight = `${height}px`;
   //const existing = localStorage.getItem(localStorageKey);
   if(!profile){
     return;
   }


   async function getNotes(){
     const res = await fetch(
       `https://cbcgokptxc7hlfo3acolfdbjvy0dqpzj.lambda-url.ca-central-1.on.aws?email=${profile.email}`,
       {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
         },
       }
     );
     const jsonResult = await res.json();
     console.log(jsonResult);
     if(!notes.length){
       setNotes([]);
     }
     else if(jsonResult.length != null && jsonResult ){
       setNotes(jsonResult)
     }
    
   }
getNotes();
 }, [profile]);


 useEffect(() => {
   localStorage.setItem(localStorageKey, JSON.stringify(notes));
 }, [notes]);


 useEffect(() => {
   if (currentNote < 0) {
     return;
   }
   if (!editMode) {
     navigate(`/notes/${currentNote + 1}`);
     return;
   }
   navigate(`/notes/${currentNote + 1}/edit`);
 }, [notes]);


 const saveNote = async (note, index) => {
   const {title, body, when} = note;
   const newNote = {title, body, when, id: note.id};
   note.body = note.body.replaceAll("<p><br></p>", "");
   setNotes([
     ...notes.slice(0, index),
     { ...note },
     ...notes.slice(index + 1),
   ]);
   setCurrentNote(index);
   setEditMode(false);




   const res = await fetch(
    "https://cja42zp3udhqeoz6leot5uagga0wqbke.lambda-url.ca-central-1.on.aws/",
     {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ ...newNote, email: profile.email }),
     }
   );


   const jsonRes = await res.json();
   console.log(jsonRes);
 };


 const deleteNote = async (index) => {
   const noteId = notes[index].id;
   console.log(noteId);


   const res = await fetch( `https://lqxojmqh3hqcbz47nvgxw4bmj40bbptf.lambda-url.ca-central-1.on.aws?email=${profile.email}&id=${noteId}`,
   {
     method: "DELETE",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({email: profile.email, id: noteId}),
   });
  
   setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
   setCurrentNote(0);
   setEditMode(false);


   const jsonRes = await res.json();
   console.log(jsonRes);
 };


 const addNote = () => {
   setNotes([
     {
       id: uuidv4(),
       title: "Untitled",
       body: "",
       when: currentDate(),
     },
     ...notes,
   ]);
   setEditMode(true);
   setCurrentNote(0);
 };


 return (
   <div id="container">
     <header>
       <aside>
         <button id="menu-button" onClick={() => setCollapse(!collapse)}>
           &#9776;
         </button>
       </aside>
       <div id="app-header">
         <h1>
           <Link to="/notes">Lotion</Link>
         </h1>
         <h6 id="app-moto">Like Notion, but worse.</h6>
       </div>


       {profile ? (
         <div className="profile">
           <div className="email_">
             <div className="email">
               <img
                 className='profileImage'
                 style={{ borderRadius: '50%', height: '50px', marginTop: '10px', marginRight: '10px'}}
                 src={profile.picture}
                 alt='user image'
               />
               <p className="mail" style={{display: "inline-block"}}>{profile.email}</p>
             </div>
             <button style={{marginTop:"100px"}} className="signOut" onClick={logOut}>
               {" "}
               Sign Out{" "}
             </button>
           </div>
         </div>
       ) : (
         <aside>&nbsp;</aside>
       )}


     </header>
     <div id="main-container" ref={mainContainerRef}>
       {profile ? (
         <aside id="sidebar" className={collapse ? "hidden" : null}>
           <header>
             <div id="notes-list-heading">
               <h2>Notes</h2>
               <button id="new-note-button" onClick={addNote}>
                 +
               </button>
             </div>
           </header>
           <div id="notes-holder">
             <NoteList notes={notes} />
           </div>
         </aside>
       ) : (
         <></>
       )}


       <div id="write-box">
         {profile ? (
           <Outlet context={[notes, saveNote, deleteNote]} />
         ) : (
           <div id="login-button-div">
             <button className='signIn' onClick={() => login()}>
               Sign in with{' '}
               <img className='image' src='https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png' alt="google" />
             </button>
           </div>
         )}
       </div>
     </div>
   </div>
 );
}


export default Layout;
