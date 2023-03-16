import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.override.css';

import LandingPage from './components/pages/LandingPage';
import Dashboard from './components/pages/Dashboard';
import Room from './components/pages/Room/room';

/* 
  Client app:
  - Press button -> Create Room -> Wait for vet to join
  - If vet joins room, set assignedVet in client schema to vet's id
  - If vet leaves room, set assignedVet to null
  - After closing room, set assignedVet to null

  Vet's Webapp:
  - Login -> Dashboard -> Enter Room
  - Dashboard
    - Show list of rooms where roomId & client has no assignedVet
      - Will use graphql subscription for this
    - Can set online or offduty
      - If online, show roomIds on dashboard
      - If off duty, send a notification to phone to join room

  - After entering room, check if participants > 1
  - If so, means a vet already joined so
    - Leave room
    - Go back to dashboard

  Vet's mobile app:
  - Splash Screen -> Login Screen -> Waiting Screen -> Enter Room
  - If notification,
    - After press, send to room
    - If entered room, pause notifications
  - If room info is updated in backend,
    - remove that notification
    - if clicked on invalid room, move back to wating screen
    
*/

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/room/:id" component={Room} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>

      <ToastContainer
        position="bottom-left"
        autoClose={false}
        transition={Flip}
        hideProgressBar
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
