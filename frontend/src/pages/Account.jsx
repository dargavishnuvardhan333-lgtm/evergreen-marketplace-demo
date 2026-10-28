import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';

export default function Account() {
  const { user } = useStore();
  return (
    <section className="page-container account-page">
      <p className="eyebrow">YOUR CORNER OF THE STORE</p><h1>Hello, <em>{user.name.split(' ')[0]}.</em></h1>
      <div className="account-card"><div><span className="eyebrow">ACCOUNT DETAILS</span><h2>{user.name}</h2><p>{user.email}</p><span className="role-chip">{user.role === 'admin' ? 'Store administrator' : 'Customer account'}</span></div><div className="account-links"><Link to="/orders">View my orders <span>→</span></Link>{user.role === 'admin' && <Link to="/admin">Open store dashboard <span>→</span></Link>}</div></div>
      <p className="muted account-note">For your security, your sign-in session is kept in this browser tab. Signing out clears it.</p>
    </section>
  );
}
