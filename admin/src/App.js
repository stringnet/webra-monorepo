import React, { useState, useEffect } from 'react';
import { Users, LayoutDashboard, FolderKanban, LogOut, Menu, X, Share2, QrCode, Trash2, Edit, Sparkles, Wand2, PartyPopper, Target, LoaderCircle, PlusCircle, UploadCloud, FileCheck2 } from 'lucide-react';

// =================================================================================
// ¡ACCIÓN REQUERIDA! REEMPLAZA ESTE VALOR
// =================================================================================
// Pega aquí únicamente el "Cloud Name" de tu cuenta de Cloudinary.
// Esta clave es pública y segura de tener aquí.
const CLOUDINARY_CLOUD_NAME = 'ditgncrxp'; 
// =================================================================================

// --- API Configuration ---
const API_URL = 'https://apiwebra.scanmee.io';


// --- Helper Function ---
const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error decoding JWT", e);
        return null;
    }
};

// --- API Service ---
const apiService = {
    getSignature: async (token) => {
        const response = await fetch(`${API_URL}/api/upload/signature`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la firma para la subida.');
        return response.json();
    },
    uploadToCloudinary: async (file, signatureData) => {
        const formData = new FormData();
        formData.append('file', file);
        // AHORA USAMOS LA API_KEY QUE VIENE DE LA API DE FORMA SEGURA
        formData.append('api_key', signatureData.api_key); 
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error("Cloudinary upload failed response:", await response.text());
            throw new Error('La subida a Cloudinary falló.');
        }
        return response.json();
    },
    getProjects: async (token) => {
        const response = await fetch(`${API_URL}/api/projects`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al obtener los proyectos.');
        return response.json();
    },
    createProject: async (token, projectData) => {
        const response = await fetch(`${API_URL}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(projectData)
        });
        if (!response.ok) throw new Error('Error al crear el proyecto.');
        return response.json();
    }
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
    // Código del modal de Gemini sin cambios
};

// --- COMPONENTE MODAL DE CREACIÓN DE PROYECTO (ACTUALIZADO) ---
const CreateProjectModal = ({ onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [markerType, setMarkerType] = useState('image');
    
    const [modelFile, setModelFile] = useState({ file: null, url: null, status: 'idle' }); // idle, uploading, done, error
    const [markerFile, setMarkerFile] = useState({ file: null, url: null, status: 'idle' });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (file, fileType) => {
        if (!file) return;

        const updateState = fileType === 'model' ? setModelFile : setMarkerFile;
        updateState({ file: file, url: null, status: 'uploading' });

        try {
            const token = localStorage.getItem('webar_token');
            const signatureData = await apiService.getSignature(token);
            const uploadResult = await apiService.uploadToCloudinary(file, signatureData);
            updateState({ file: file, url: uploadResult.secure_url, status: 'done' });
        } catch (err) {
            console.error(`Error al subir ${fileType}:`, err);
            updateState({ file: file, url: null, status: 'error' });
            setError(`Error al subir el archivo ${fileType}.`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (modelFile.status !== 'done' || markerFile.status !== 'done') {
            setError('Por favor, espera a que todos los archivos se hayan subido.');
            return;
        }

        setLoading(true);
        const projectData = {
            name: name,
            model_url: modelFile.url,
            marker_type: markerType,
            marker_url: markerFile.url,
        };
        
        try {
            const token = localStorage.getItem('webar_token');
            const newProject = await apiService.createProject(token, projectData);
            onProjectCreated(newProject);
            onClose();
        } catch (err) {
            setError(err.message || "Ocurrió un error desconocido.");
        } finally {
            setLoading(false);
        }
    };

    const FileInput = ({ label, onFileSelect, status, fileName }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${status === 'error' ? 'border-red-400' : 'border-gray-300'} border-dashed rounded-md`}>
                <div className="space-y-1 text-center">
                    {status === 'idle' && <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />}
                    {status === 'uploading' && <LoaderCircle className="mx-auto h-12 w-12 text-blue-500 animate-spin" />}
                    {status === 'done' && <FileCheck2 className="mx-auto h-12 w-12 text-green-500" />}
                    {status === 'error' && <X className="mx-auto h-12 w-12 text-red-500" />}
                    
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor={label} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>{status === 'done' ? 'Cambiar archivo' : 'Selecciona un archivo'}</span>
                            <input id={label} name={label} type="file" className="sr-only" onChange={(e) => onFileSelect(e.target.files[0])} />
                        </label>
                    </div>
                     <p className="text-xs text-gray-500">
                        {status === 'done' ? fileName : 'FBX, GLB, GLTF, OBJ, WEBM, PNG, JPG'}
                     </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center"><PlusCircle className="text-blue-500 mr-2" />Crear Nuevo Proyecto</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>

                        <FileInput label="Modelo 3D" onFileSelect={(file) => handleFileChange(file, 'model')} status={modelFile.status} fileName={modelFile.file?.name} />
                        <FileInput label="Marcador (Imagen)" onFileSelect={(file) => handleFileChange(file, 'marker')} status={markerFile.status} fileName={markerFile.file?.name} />
                        
                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400" disabled={loading || modelFile.status !== 'done' || markerFile.status !== 'done'}>
                            {loading ? <LoaderCircle className="animate-spin" /> : 'Crear Proyecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- VISTAS PRINCIPALES ---
const DashboardView = ({ user }) => (
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('webar_token');
            if (!token) throw new Error("No se encontró token.");
            const data = await apiService.getProjects(token);
            setProjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleProjectCreated = (newProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    return (
        <div>
            {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} onProjectCreated={handleProjectCreated} />}
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-gray-800">Proyectos de Realidad Aumentada</h1><p className="text-gray-500 mt-1">Crea, gestiona y comparte tus experiencias de RA.</p></div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center">
                    <PlusCircle className="mr-2" size={20} />
                    Crear Nuevo Proyecto
                </button>
            </div>
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-x-auto">
                 {loading ? (
                    <div className="flex justify-center items-center p-10"><LoaderCircle className="animate-spin text-blue-500" size={40} /><span className="ml-4 text-gray-600">Cargando proyectos...</span></div>
                ) : error ? (
                    <div className="text-center p-10 text-red-500 bg-red-50"><strong>Error:</strong> {error}</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Vista</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th></tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.length > 0 ? projects.map(project => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.marker_type === 'image' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{project.marker_type === 'image' ? 'Imagen' : 'Código QR'}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline"><a href={project.view_url} target="_blank" rel="noopener noreferrer">{project.view_url}</a></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button className="text-gray-400 hover:text-yellow-500 p-2 rounded-full transition-colors" title="Asistente de Marketing IA"><Sparkles size={18} /></button>
                                            <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors" title="Ver Código QR"><QrCode size={18} /></button>
                                            <button className="text-gray-400 hover:text-green-600 p-2 rounded-full transition-colors" title="Editar"><Edit size={18} /></button>
                                            <button className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors" title="Eliminar"><Trash2 size={18} /></button>
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
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('webar_token');
        if (token) {
            const decodedPayload = decodeJwt(token);
            if (decodedPayload && decodedPayload.user) {
                const userWithEmail = { ...decodedPayload.user, email: 'roberto@stringnet.pe' };
                setUser(userWithEmail);
            }
        }
        setAuthReady(true);
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

    if (!authReady) {
        return <div className="flex h-screen w-full items-center justify-center"><LoaderCircle className="animate-spin text-blue-500" size={40} /></div>;
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <DashboardPage user={user} onLogout={handleLogout} />;
}
