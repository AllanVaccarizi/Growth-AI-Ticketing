// TicketingApp.jsx - Version avec CSS vanilla
import React, { useState } from 'react';
import './styles.css'; // Importez le fichier CSS
import { supabase } from './lib/supabase';
import bcrypt from 'bcryptjs';

// Icônes SVG intégrées
const Lock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const User = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const AlertTriangle = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const MessageSquare = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const Workflow = ({ size = 40 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="6" height="6" rx="1"/>
    <rect x="15" y="3" width="6" height="6" rx="1"/>
    <rect x="9" y="15" width="6" height="6" rx="1"/>
    <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
  </svg>
);

const Settings = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const CheckCircle = ({ size = 48 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const TicketingApp = () => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentClientId, setCurrentClientId] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [ticketData, setTicketData] = useState({
    clientName: '',
    workflow: '',
    node: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Vous pouvez supprimer mockUsers maintenant
  
  const handleLogin = async () => {
  // Vérifier si bloqué
  if (isBlocked) {
    alert('Trop de tentatives. Réessayez dans quelques minutes.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('growth_ai_ticketing_clients')
      .select('id, username, company_name, password')
      .eq('username', loginData.username)
      .single();

    if (error) throw error;

    if (data) {
      const isPasswordValid = await bcrypt.compare(loginData.password, data.password);
      
      if (isPasswordValid) {
        // Reset tentatives en cas de succès
        setLoginAttempts(0);
        setIsLoggedIn(true);
        setCurrentUser(data.company_name);
        setCurrentClientId(data.id);
        setTicketData(prev => ({ ...prev, clientName: data.company_name }));
      } else {
        throw new Error('Mot de passe incorrect');
      }
    }
  } catch (error) {
    // Incrémenter les tentatives
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setIsBlocked(true);
      // Débloquer après 5 minutes
      setTimeout(() => {
        setIsBlocked(false);
        setLoginAttempts(0);
      }, 5 * 60 * 1000);
      alert('Trop de tentatives incorrectes. Compte bloqué 5 minutes.');
    } else {
      alert(`Identifiants incorrects (${newAttempts}/5 tentatives)`);
    }
  }
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleTicketSubmit = async () => {
    // Validations renforcées
    if (!ticketData.workflow || ticketData.workflow.trim().length < 2) {
      alert('Le nom du workflow doit contenir au moins 2 caractères');
      return;
    }
    
    if (!ticketData.description || ticketData.description.trim().length < 10) {
      alert('La description doit contenir au moins 10 caractères');
      return;
    }
    
    // Limite de taille pour éviter les attaques
    if (ticketData.description.length > 5000) {
      alert('La description ne peut pas dépasser 5000 caractères');
      return;
    }
      
    setIsSubmitting(true);
    
    try {
      // 1. Sauvegarder dans Supabase
      const { error } = await supabase
        .from('growth_ai_tickets')
        .insert([{
          client_id: currentClientId,
          workflow_name: ticketData.workflow,
          node_name: ticketData.node || null,
          description: ticketData.description,
          status: 'open'
        }]);

      if (error) throw error;

      // 2. Envoyer vers n8n webhook
      const webhookData = {
        client_name: currentUser,
        client_id: currentClientId,
        workflow_name: ticketData.workflow,
        node_name: ticketData.node || null,
        description: ticketData.description,
        status: 'open',
        created_at: new Date().toISOString()
      };

      const webhookResponse = await fetch(process.env.REACT_APP_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!webhookResponse.ok) {
        throw new Error('Erreur webhook');
      }

      setSubmitSuccess(true);
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setTicketData({ 
          clientName: currentUser, 
          workflow: '', 
          node: '', 
          description: '' 
        });
      }, 3000);

    } catch (error) {
      alert('Erreur lors de la création du ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setLoginData({ username: '', password: '' });
    setTicketData({ clientName: '', workflow: '', node: '', description: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        {/* Effets de fond */}
        <div className="bg-effects">
          <div className="gradient-blob-1"></div>
          <div className="gradient-blob-2"></div>
          <div className="gradient-blob-3"></div>
        </div>

        <div className="main-content">
          <div className="login-container">
            <div className="login-card">
              {/* Header */}
              <div className="login-header">
                <div className="logo-container">
                  <img 
                    src="https://cdn.prod.website-files.com/6825df5b20329ba581df4914/687a605bf7686b19459777f9_only_logo_Growth_AI-removebg-pre%20(1).png" 
                    alt="Growth AI Logo" 
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                </div>
                <h1 className="main-title">Growth AI Ticketing</h1>
                <p className="subtitle">Connectez-vous pour créer un ticket de support</p>
              </div>

              {/* Formulaire de connexion */}
              <div className="glass-card">
                <div className="form-group">
                  <label className="form-label">
                    <User />
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    onKeyPress={handleKeyPress} // ← Ajoutez ça
                    className="form-input"
                    placeholder="Votre nom d'utilisateur"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock />
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={handleKeyPress} // ← Ajoutez ça
                    className="form-input"
                    placeholder="Votre mot de passe"
                  />
                </div>

                <button onClick={handleLogin} className="btn-primary">
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Effets de fond */}
      <div className="bg-effects">
        <div className="gradient-blob-1"></div>
        <div className="gradient-blob-2"></div>
      </div>

      <div className="main-content">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-logo">
                <img 
                  src="https://cdn.prod.website-files.com/6825df5b20329ba581df4914/687a605bf7686b19459777f9_only_logo_Growth_AI-removebg-pre%20(1).png" 
                  alt="Growth AI Logo" 
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                />
              </div>
              <div className="header-info">
                <h1>Support Portal</h1>
                <p>Bienvenue, {currentUser}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Déconnexion
            </button>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="main-container">
          {submitSuccess ? (
            <div className="success-container">
              <div className="success-icon">
                <CheckCircle size={48} />
              </div>
              <h2 className="success-title">Ticket créé avec succès !</h2>
              <p className="success-description">Nous vous recontacterons dans les plus brefs délais.</p>
            </div>
          ) : (
            <div>
              <div className="section-header">
                <h2 className="section-title">Créer un ticket de support</h2>
                <p className="section-description">Décrivez le problème rencontré avec vos workflows</p>
              </div>

              <div className="glass-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      <User />
                      Nom du client
                    </label>
                    <input
                      type="text"
                      value={ticketData.clientName}
                      className="form-input"
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Workflow size={16} />
                      Workflow concerné
                    </label>
                    <input
                      type="text"
                      value={ticketData.workflow}
                      onChange={(e) => setTicketData(prev => ({ ...prev, workflow: e.target.value }))}
                      className="form-input"
                      placeholder="Nom du workflow qui pose problème"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Settings />
                    Node/stack concerné (optionnel)
                  </label>
                  <input
                    type="text"
                    value={ticketData.node}
                    onChange={(e) => setTicketData(prev => ({ ...prev, node: e.target.value }))}
                    className="form-input"
                    placeholder="Ex: HTTP Request, Webhook, Code..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare />
                    Description de la deamande
                  </label>
                  <textarea
                    value={ticketData.description}
                    onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                    className="form-textarea"
                    placeholder="Décrivez en détail le problème rencontré, les étapes pour le reproduire, les messages d'erreur..."
                  />
                </div>

                <button
                  onClick={handleTicketSubmit}
                  disabled={isSubmitting || !ticketData.workflow || !ticketData.description}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Création du ticket...
                    </>
                  ) : (
                    <>
                      <AlertTriangle />
                      Créer le ticket
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TicketingApp;