import React, { useState, useEffect } from 'react';
import { Users, LayoutDashboard, FolderKanban, LogOut, Menu, X, Share2, QrCode, Trash2, Edit, Sparkles, Wand2, PartyPopper, Target, LoaderCircle } from 'lucide-react';

// --- API Configuration ---
const API_URL = 'https://apiwebra.scanmee.io';

// --- Helper Function ---
// Decodifica un token JWT de forma simple para obtener el payload.
const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error decoding JWT", e);
        return null;
    }
};

// --- API Service ---
// Un objeto para manejar las llamadas a la API de forma centralizada.
const apiService = {
    getProjects: async (token) => {
        const response = await fetch(`${API_URL}/api/projects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener los proyectos.');
        }
        return response.json();
    }
    // Aquí añadiremos createProject, deleteProject, etc. en el futuro
};


// --- COMPONENTES DE LA UI ---

const SidebarHeader = () => (
    <div className="p-4 pb-2 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Share2 className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold text-white">WebRA</h1>
        </div>
    </div>
);

const SidebarItem = ({ icon, text, active, onClick }) => (
    <li className="px-4">
        <a href="#" onClick={onClick} className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
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
                    {user && user.role === 'admin' && (<SidebarItem icon={<Users size={20} />} text="Usuarios" active={activeView === 'users'} onClick={() => onNavigate('users')} />)}
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
                <span className={`text-xs font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
                <span className="text-xs text-gray-400 ml-1">vs mes anterior</span>
            </div>
        </div>
        <div className="bg-blue-100 p-4 rounded-full">{icon}</div>
    </div>
);

const MarketingIdeasModal = ({ project, onClose }) => {
    // ... (Código del modal de Gemini sin cambios)
};

// --- VISTAS PRINCIPALES ---

const DashboardView = ({ user }) => (
    // ... (Código del Dashboard sin cambios)
    <div>
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Aquí tienes un resumen de la actividad de la plataforma.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"><StatCard title="Total de Proyectos" value="3" icon={<FolderKanban className="text-blue-500" />} change="+5" changeType="increase" /><StatCard title="Total de Usuarios" value="12" icon={<Users className="text-blue-500" />} change="+2" changeType="increase" /><StatCard title="Visualizaciones" value="1,287" icon={<Share2 className="text-blue-500" />} change="-10%" changeType="decrease" /></div>
    </div>
);

const ProjectsView = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            console.log("ProjectsView: Iniciando la obtención de proyectos...");
            try {
                const token = localStorage.getItem('webar_token');
                if (!token) {
                    console.error("ProjectsView: No se encontró token en localStorage.");
                    throw new Error("No se encontró token de autenticación. Por favor, inicie sesión de nuevo.");
                }
                console.log("ProjectsView: Token encontrado. Llamando a la API...");
                const data = await apiService.getProjects(token);
                console.log("ProjectsView: Datos recibidos de la API:", data);
                setProjects(data);
            } catch (err) {
                console.error("ProjectsView: Error al obtener proyectos:", err);
                setError(err.message);
            } finally {
                setLoading(false);
                console.log("ProjectsView: Carga finalizada.");
            }
        };

        fetchProjects();
    }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

    const handleDelete = (id) => { if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) { /* Lógica de eliminar aquí */ } };
    const handleOpenAIAssistant = (project) => { setSelectedProject(project); setIsModalOpen(true); };

    return (
        <div>
            {isModalOpen && selectedProject && <MarketingIdeasModal project={selectedProject} onClose={() => setIsModalOpen(false)} />}
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-gray-800">Proyectos de Realidad Aumentada</h1><p className="text-gray-500 mt-1">Crea, gestiona y comparte tus experiencias de RA.</p></div>
                <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">Crear Nuevo Proyecto</button>
            </div>
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center p-10">
                        <LoaderCircle className="animate-spin text-blue-500" size={40} />
                        <span className="ml-4 text-gray-600">Cargando proyectos...</span>
                    </div>
                ) : error ? (
                    <div className="text-center p-10 text-red-500 bg-red-50">
                        <strong>Error:</strong> {error}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Vista</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.length > 0 ? projects.map(project => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.marker_type === 'image' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{project.marker_type === 'image' ? 'Imagen' : 'Código QR'}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline"><a href={project.view_url} target="_blank" rel="noopener noreferrer">{project.view_url}</a></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button onClick={() => handleOpenAIAssistant(project)} className="text-gray-400 hover:text-yellow-500 p-2 rounded-full transition-colors" title="Asistente de Marketing IA"><Sparkles size={18} /></button>
                                            <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors" title="Ver Código QR"><QrCode size={18} /></button>
                                            <button className="text-gray-400 hover:text-green-600 p-2 rounded-full transition-colors" title="Editar"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-gray-500">No tienes proyectos todavía. ¡Crea el primero!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const UsersView = () => (
    <div><h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1><p className="text-gray-500 mt-1">Crea y administra los usuarios de la plataforma.</p><div className="mt-8 bg-white rounded-xl shadow-md p-10 text-center"><p className="text-gray-600">La funcionalidad de gestión de usuarios se implementará aquí.</p></div></div>
);


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
            if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión.');
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
    const handleNavigate = (view) => { setActiveView(view); if (window.innerWidth < 768) { setSidebarOpen(false); } };

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


export default function App() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('webar_token');
        if (token) {
            const decodedPayload = decodeJwt(token);
            if (decodedPayload && decodedPayload.user) {
                // Para el perfil, necesitamos el email, que no está en el token actualmente.
                // Lo añadimos manualmente por ahora.
                const userWithEmail = { ...decodedPayload.user, email: 'roberto@stringnet.pe' };
                setUser(userWithEmail);
            }
        }
        setAuthReady(true); // Marcamos la autenticación como lista
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('webar_token', token);
        const decodedPayload = decodeJwt(token);
        if (decodedPayload && decodedPayload.user) {
             const userWithEmail = { ...decodedPayload.user, email: 'roberto@stringnet.pe' };
             setUser(userWithEmail);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('webar_token');
        setUser(null);
    };

    // No renderizar nada hasta que el chequeo inicial de autenticación haya terminado
    if (!authReady) {
        return <div className="flex h-screen w-full items-center justify-center"><LoaderCircle className="animate-spin text-blue-500" size={40} /></div>;
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <DashboardPage user={user} onLogout={handleLogout} />;
}