import React, { useState, useEffect } from 'react';
import { Users, LayoutDashboard, FolderKanban, LogOut, Menu, X, Share2, QrCode, Trash2, Edit, Sparkles, Wand2, PartyPopper, Target } from 'lucide-react';

// --- API Configuration ---
const API_URL = 'https://apiwebra.scanmee.io';

// --- Helper Function ---
// Decodifica un token JWT de forma simple para obtener el payload.
// Nota: Esto no valida la firma, solo decodifica. La validación ocurre en el backend.
const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error decoding JWT", e);
        return null;
    }
};


// Mock Data - Simula los datos que vendrían de la API (Aún los usamos para vistas no conectadas)
const mockProjects = [
  { id: 1, name: 'Proyecto Edificio 3D', modelUrl: 'modelo_edificio.glb', markerType: 'image', viewUrl: 'https://apiwebra.scanmee.io/view/a1b2c3d4', createdAt: '2024-06-15' },
  { id: 2, name: 'Campaña Marketing Auto', modelUrl: 'modelo_auto.glb', markerType: 'qr', viewUrl: 'https://apiwebra.scanmee.io/view/e5f6g7h8', createdAt: '2024-06-18' },
  { id: 3, name: 'Visualizador Mueble', modelUrl: 'modelo_silla.glb', markerType: 'image', viewUrl: 'https://apiwebra.scanmee.io/view/i9j0k1l2', createdAt: '2024-06-20' },
];

// --- COMPONENTES DE LA UI ---

const SidebarHeader = () => (
    <div className="p-4 pb-2 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">WebRA</h1>
        </div>
    </div>
);

const SidebarItem = ({ icon, text, active, onClick }) => (
    <li className="px-4">
        <a
            href="#"
            onClick={onClick}
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out
            ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            {icon}
            <span className="ml-3 font-medium">{text}</span>
        </a>
    </li>
);

const UserProfile = ({ user, onLogout }) => (
    <div className="px-4 border-t border-gray-700 mt-auto pt-4 mb-4">
        <div className="flex items-center">
            <img className="h-10 w-10 rounded-full object-cover" src={`https://placehold.co/100x100/7c3aed/ffffff?text=${user.name.charAt(0)}`} alt="Avatar de Usuario" />
            <div className="ml-3">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <button onClick={onLogout} className="ml-auto p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <LogOut className="h-5 w-5 text-gray-400" />
            </button>
        </div>
    </div>
);

const Sidebar = ({ user, onLogout, onNavigate, activeView, isOpen, setIsOpen }) => (
    <>
        <aside className={`fixed inset-y-0 left-0 bg-gray-800 shadow-xl z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 flex-shrink-0 flex flex-col`}>
            <SidebarHeader />
            <nav className="mt-6 flex-grow">
                <ul>
                    <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                    <SidebarItem icon={<FolderKanban size={20} />} text="Proyectos RA" active={activeView === 'projects'} onClick={() => onNavigate('projects')} />
                    {user && user.role === 'admin' && (
                        <SidebarItem icon={<Users size={20} />} text="Usuarios" active={activeView === 'users'} onClick={() => onNavigate('users')} />
                    )}
                </ul>
            </nav>
            <UserProfile user={user} onLogout={onLogout} />
        </aside>
        {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
);

const StatCard = ({ title, value, icon, change, changeType }) => (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between transition-transform hover:scale-105">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            <div className="flex items-center mt-2">
                 <span className={`text-xs font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </span>
                <span className="text-xs text-gray-400 ml-1">vs mes anterior</span>
            </div>
        </div>
        <div className="bg-blue-100 p-4 rounded-full">
            {icon}
        </div>
    </div>
);

const MarketingIdeasModal = ({ project, onClose }) => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateIdeas = async () => {
        setLoading(true);
        setError(null);
        setIdeas([]);
        const prompt = `Eres un experto en marketing digital. Para un proyecto de Realidad Aumentada llamado "${project.name}", genera 3 ideas de campañas de marketing creativas y concisas. Para cada idea, proporciona un nombre de campaña, un eslogan y el público objetivo.`;
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: { "marketing_ideas": { type: "ARRAY", items: { type: "OBJECT", properties: { "campaign_name": { "type": "STRING" }, "slogan": { "type": "STRING" }, "target_audience": { "type": "STRING" } }, required: ["campaign_name", "slogan", "target_audience"] } } }, required: ["marketing_ideas"]
                }
            }
        };
        const apiKey = ""; 
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
                setIdeas(parsedJson.marketing_ideas || []);
            } else { throw new Error('No se recibieron ideas en la respuesta.'); }
        } catch (err) {
            setError(err.message || 'Ocurrió un error al generar las ideas.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" style={{animation: 'fadeInUp 0.3s ease-out forwards'}}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center"><Sparkles className="text-yellow-500 mr-2" />Asistente de Marketing IA</h2>
                        <p className="text-sm text-gray-500">Ideas para el proyecto: <span className="font-semibold">{project.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
                </div>
                <div className="p-6" style={{minHeight: '20rem'}}>{loading ? (<div className="flex flex-col items-center justify-center h-full"><Wand2 className="text-blue-500 h-12 w-12 animate-pulse" /><p className="text-gray-600 mt-4">Generando ideas mágicas...</p></div>) : error ? (<div className="text-center text-red-500 bg-red-50 p-4 rounded-lg"><p><strong>¡Ups! Algo salió mal.</strong></p><p className="text-sm">{error}</p></div>) : ideas.length > 0 ? (<div className="space-y-4">{ideas.map((idea, index) => (<div key={index} className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 transition-shadow hover:shadow-md"><h3 className="text-lg font-semibold text-blue-700 flex items-center"><PartyPopper size={20} className="mr-2 text-blue-500" />{idea.campaign_name}</h3><p className="text-gray-700 mt-1 italic">"{idea.slogan}"</p><div className="flex items-center mt-3 text-sm text-gray-500"><Target size={16} className="mr-2 text-gray-400" /><strong>Público Objetivo:</strong><span className="ml-1">{idea.target_audience}</span></div></div>))}</div>) : (<div className="text-center flex flex-col items-center justify-center h-full"><p className="text-gray-500 mb-4">Haz clic en el botón para obtener ideas de marketing para tu proyecto.</p><button onClick={generateIdeas} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center"><Sparkles className="mr-2" size={20} />✨ Generar Ideas con IA</button></div>)}</div>
            </div><style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

// --- VISTAS PRINCIPALES ---

const DashboardView = ({ user }) => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Aquí tienes un resumen de la actividad de la plataforma.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"><StatCard title="Total de Proyectos" value="3" icon={<FolderKanban className="text-blue-500" />} change="+5" changeType="increase" /><StatCard title="Total de Usuarios" value="12" icon={<Users className="text-blue-500" />} change="+2" changeType="increase" /><StatCard title="Visualizaciones" value="1,287" icon={<Share2 className="text-blue-500" />} change="-10%" changeType="decrease" /></div>
        <div className="mt-10"><h2 className="text-xl font-semibold text-gray-700 mb-4">Proyectos Recientes</h2><div className="bg-white rounded-xl shadow-md overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Marcador</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{mockProjects.slice(0, 3).map(project => (<tr key={project.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.markerType === 'image' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{project.markerType === 'image' ? 'Imagen' : 'Código QR'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.createdAt}</td></tr>))}</tbody></table></div></div>
    </div>
);

const ProjectsView = () => {
    const [projects, setProjects] = useState(mockProjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const handleDelete = (id) => { if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) { setProjects(projects.filter(p => p.id !== id)); } };
    const handleOpenAIAssistant = (project) => { setSelectedProject(project); setIsModalOpen(true); };
    return (
        <div>
            {isModalOpen && selectedProject && <MarketingIdeasModal project={selectedProject} onClose={() => setIsModalOpen(false)} />}
            <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold text-gray-800">Proyectos de Realidad Aumentada</h1><p className="text-gray-500 mt-1">Crea, gestiona y comparte tus experiencias de RA.</p></div><button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">Crear Nuevo Proyecto</button></div>
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Vista</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{projects.map(project => (<tr key={project.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.markerType === 'image' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{project.markerType === 'image' ? 'Imagen' : 'Código QR'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline"><a href={project.viewUrl} target="_blank" rel="noopener noreferrer">{project.viewUrl}</a></td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center"><div className="flex items-center justify-center space-x-1"><button onClick={() => handleOpenAIAssistant(project)} className="text-gray-400 hover:text-yellow-500 p-2 rounded-full transition-colors" title="Asistente de Marketing IA"><Sparkles size={18} /></button><button className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors" title="Ver Código QR"><QrCode size={18} /></button><button className="text-gray-400 hover:text-green-600 p-2 rounded-full transition-colors" title="Editar"><Edit size={18} /></button><button onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors" title="Eliminar"><Trash2 size={18} /></button></div></td></tr>))}</tbody></table></div>
        </div>
    );
};

const UsersView = () => (
    <div><h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1><p className="text-gray-500 mt-1">Crea y administra los usuarios de la plataforma.</p><div className="mt-8 bg-white rounded-xl shadow-md p-10 text-center"><p className="text-gray-600">La funcionalidad de gestión de usuarios se implementará aquí.</p></div></div>
);


// --- PÁGINAS PRINCIPALES (Login y Dashboard) ---

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión.');
            }
            
            // Si el login es exitoso, llamamos a onLogin con el token
            onLogin(data.token);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>
            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8"><div className="inline-flex items-center space-x-3"><div className="bg-blue-600 p-3 rounded-xl"><Share2 className="w-8 h-8 text-white" /></div><h1 className="text-4xl font-bold text-white">WebRA</h1></div><p className="text-gray-400 mt-2">Plataforma de Creación de Realidad Aumentada</p></div>
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-1">Bienvenido de nuevo</h2><p className="text-center text-gray-400 mb-6">Inicia sesión para continuar</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4"><label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">Correo Electrónico</label><input className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} /></div>
                        <div className="mb-6"><label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">Contraseña</label><input className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" id="password" type="password" placeholder="******************" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} /></div>
                        {error && <p className="text-red-500 text-xs text-center mb-4 bg-red-500/10 p-2 rounded-lg">{error}</p>}
                        <div className="flex items-center justify-between">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200 flex items-center justify-center disabled:bg-blue-800" type="submit" disabled={loading}>
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="text-center text-gray-500 text-xs mt-8">&copy;2024 WebRA. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

const DashboardPage = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView user={user} />;
            case 'projects': return <ProjectsView />;
            case 'users': return <UsersView />;
            default: return <DashboardView user={user} />;
        }
    };

    const handleNavigate = (view) => {
        setActiveView(view);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar user={user} onLogout={onLogout} onNavigate={handleNavigate} activeView={activeView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                 <header className="bg-white shadow-sm p-4 md:hidden"><button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none"><Menu size={24} /></button></header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">{renderView()}</main>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
export default function App() {
    const [user, setUser] = useState(null);

    // Efecto para comprobar si hay un token en el almacenamiento al cargar la app
    useEffect(() => {
        const token = localStorage.getItem('webar_token');
        if (token) {
            const decodedPayload = decodeJwt(token);
            // El payload del token se encuentra dentro de la propiedad 'user'
            if (decodedPayload && decodedPayload.user) {
                setUser(decodedPayload.user);
            }
        }
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('webar_token', token);
        const decodedPayload = decodeJwt(token);
        if (decodedPayload && decodedPayload.user) {
            setUser(decodedPayload.user);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('webar_token');
        setUser(null);
    };

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <DashboardPage user={user} onLogout={handleLogout} />;
}