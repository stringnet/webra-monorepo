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
        formData.append('api_key', signatureData.api_key); 
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);

        const resourceType = file.type.startsWith('video') ? 'video' : 'auto';

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
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
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al crear el proyecto.');
        }
        return response.json();
    },
    updateProject: async (token, projectId, projectData) => {
        const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(projectData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el proyecto.');
        }
        return response.json();
    },
    deleteProject: async (token, projectId) => {
        const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el proyecto.');
        }
        return response.json();
    },
    getUsers: async (token) => {
        const response = await fetch(`${API_URL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Error al obtener los usuarios.');
        return response.json();
    },
    createUser: async (token, userData) => {
        const response = await fetch(`${API_URL}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(userData) });
        if (!response.ok) { const err = await response.json(); throw new Error(err.message); }
        return response.json();
    },
    updateUser: async (token, userId, userData) => {
        const response = await fetch(`${API_URL}/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(userData) });
        if (!response.ok) { const err = await response.json(); throw new Error(err.message); }
        return response.json();
    },
    deleteUser: async (token, userId) => {
        const response = await fetch(`${API_URL}/api/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) { const err = await response.json(); throw new Error(err.message); }
        return response.json();
    }
};


// --- COMPONENTES DE LA UI ---
const SidebarHeader = ({ user }) => (
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
            <SidebarHeader user={user} />
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
const MarketingIdeasModal = ({ project, onClose }) => { return null };
const QRCodeModal = ({ url, onClose }) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center relative">
                 <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Escanea para ver en RA</h2>
                 <img src={qrApiUrl} alt="Código QR" className="mx-auto" />
                 <p className="text-xs text-gray-500 mt-4 break-all">{url}</p>
            </div>
        </div>
    );
};
const FileInput = ({ label, onFileSelect, status, fileName, accept }) => (
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
                        <input id={label} name={label} type="file" className="sr-only" onChange={(e) => onFileSelect(e.target.files[0])} accept={accept} />
                    </label>
                </div>
                 <p className="text-xs text-gray-500">{status === 'done' ? fileName : accept.replaceAll(',',', ')}</p>
            </div>
        </div>
    </div>
);
const CreateProjectModal = ({ onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [assetType, setAssetType] = useState('model'); // Nuevo estado
    const [markerType, setMarkerType] = useState('image');
    const [assetFile, setAssetFile] = useState({ file: null, url: null, public_id: null, status: 'idle' });
    const [markerFile, setMarkerFile] = useState({ file: null, url: null, public_id: null, status: 'idle' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (file, fileType) => {
        if (!file) return;
        const updateState = fileType === 'asset' ? setAssetFile : setMarkerFile;
        updateState({ file, url: null, public_id: null, status: 'uploading' });

        try {
            const token = localStorage.getItem('webar_token');
            const signatureData = await apiService.getSignature(token);
            const uploadResult = await apiService.uploadToCloudinary(file, signatureData);
            updateState({ file, url: uploadResult.secure_url, public_id: uploadResult.public_id, status: 'done' });
        } catch (err) {
            updateState({ file, url: null, public_id: null, status: 'error' });
            setError(`Error al subir el archivo.`);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const isMarkerRequired = markerType === 'image';
        if (assetFile.status !== 'done' || (isMarkerRequired && markerFile.status !== 'done')) {
            setError('Por favor, sube todos los archivos requeridos.');
            return;
        }
        setLoading(true);
        const projectData = {
            name,
            asset_type: assetType, // <-- Enviar el nuevo tipo
            model_url: assetFile.url,
            marker_type: markerType,
            marker_url: isMarkerRequired ? markerFile.url : null,
            model_public_id: assetFile.public_id,
            marker_public_id: isMarkerRequired ? markerFile.public_id : null,
        };
        try {
            const token = localStorage.getItem('webar_token');
            const newProject = await apiService.createProject(token, projectData);
            onProjectCreated(newProject);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800 flex items-center"><PlusCircle className="mr-2" />Crear Nuevo Proyecto</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700">Tipo de Contenido</label>
                            <select id="asset_type" value={assetType} onChange={(e) => setAssetType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                                <option value="model">Modelo 3D</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <FileInput 
                            label={assetType === 'model' ? "Modelo 3D" : "Video con transparencia"}
                            onFileSelect={(file) => handleFileChange(file, 'asset')} 
                            status={assetFile.status} 
                            fileName={assetFile.file?.name}
                            accept={assetType === 'model' ? ".glb,.gltf" : ".webm,.mp4"}
                        />
                         <div>
                            <label htmlFor="marker_type" className="block text-sm font-medium text-gray-700">Tipo de Marcador</label>
                            <select id="marker_type" value={markerType} onChange={(e) => setMarkerType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                                <option value="image">Imagen</option>
                                <option value="qr">Código QR</option>
                            </select>
                        </div>
                        {markerType === 'image' && (
                            <FileInput 
                                label="Marcador (Imagen)" 
                                onFileSelect={(file) => handleFileChange(file, 'marker')} 
                                status={markerFile.status} 
                                fileName={markerFile.file?.name}
                                accept="image/png,image/jpeg"
                            />
                        )}
                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400" disabled={loading}>
                            {loading ? <LoaderCircle className="animate-spin" /> : 'Crear Proyecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const EditProjectModal = ({ project, onClose, onProjectUpdated }) => {
    const [name, setName] = useState(project.name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('webar_token');
            const updatedProject = await apiService.updateProject(token, project.id, { name });
            onProjectUpdated(updatedProject);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800">Editar Proyecto</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                        <input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const CreateUserModal = ({ onClose, onUserCreated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [projectLimit, setProjectLimit] = useState(5);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('webar_token');
            const newUser = await apiService.createUser(token, { name, email, password, project_limit: Number(projectLimit) });
            onUserCreated(newUser);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800">Crear Nuevo Usuario</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña Temporal</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Límite de Proyectos</label>
                            <input type="number" value={projectLimit} onChange={(e) => setProjectLimit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const EditUserModal = ({ user, onClose, onUserUpdated }) => {
    const [projectLimit, setProjectLimit] = useState(user.project_limit);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('webar_token');
            const updatedUser = await apiService.updateUser(token, user.id, { project_limit: Number(projectLimit) });
            onUserUpdated(updatedUser);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800">Editar Usuario: {user.name}</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="limit" className="block text-sm font-medium text-gray-700">Límite de Proyectos</label>
                        <input type="number" id="limit" value={projectLimit} onChange={(e) => setProjectLimit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <StatCard title="Total de Proyectos" value="3" icon={<FolderKanban className="text-blue-500" />} change="+5" changeType="increase" />
            <StatCard title="Total de Usuarios" value="12" icon={<Users className="text-blue-500" />} change="+2" changeType="increase" />
            <StatCard title="Visualizaciones" value="1,287" icon={<Share2 className="text-blue-500" />} change="-10%" changeType="decrease" />
        </div>
    </div>
);

const ProjectsView = ({user}) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('webar_token');
            if (!token) throw new Error("No hay token");
            const data = await apiService.getProjects(token);
            setProjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchProjects(); }, []);

    const handleProjectCreated = (newProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
            try {
                const token = localStorage.getItem('webar_token');
                await apiService.deleteProject(token, projectId);
                setProjects(projects.filter(p => p.id !== projectId));
            } catch (err) {
                alert(`Error al eliminar: ${err.message}`);
            }
        }
    };

    const handleProjectUpdated = (updatedProject) => {
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setEditingProject(null);
    };

    return (
        <div>
            {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} onProjectCreated={handleProjectCreated} />}
            {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onProjectUpdated={handleProjectUpdated} />}
            {qrCodeUrl && <QRCodeModal url={qrCodeUrl} onClose={() => setQrCodeUrl(null)} />}
            
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-gray-800">Proyectos de Realidad Aumentada</h1><p className="text-gray-500 mt-1">Crea, gestiona y comparte tus experiencias de RA.</p></div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 flex items-center">
                    <PlusCircle className="mr-2" size={20} />Crear Nuevo Proyecto
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
                            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenido</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Vista</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th></tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.length > 0 ? projects.map(project => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.asset_type === 'model' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{project.asset_type}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline"><a href={project.view_url} target="_blank" rel="noopener noreferrer">{project.view_url}</a></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button onClick={() => setQrCodeUrl(project.view_url)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors" title="Ver Código QR"><QrCode size={18} /></button>
                                            <button onClick={() => setEditingProject(project)} className="text-gray-400 hover:text-green-600 p-2 rounded-full transition-colors" title="Editar"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : ( <tr><td colSpan="4" className="text-center p-8 text-gray-500">No tienes proyectos todavía. ¡Crea el primero!</td></tr> )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const UsersView = ({user}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('webar_token');
            const data = await apiService.getUsers(token);
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleUserCreated = (newUser) => {
        setUsers(prevUsers => [newUser, ...prevUsers]);
    };
    
    const handleUserDeleted = async (userId) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                const token = localStorage.getItem('webar_token');
                await apiService.deleteUser(token, userId);
                setUsers(users.filter(u => u.id !== userId));
            } catch (err) {
                alert(`Error al eliminar: ${err.message}`);
            }
        }
    };
    
    const handleUserUpdated = (updatedUser) => {
        setUsers(users.map(u => (u.id === updatedUser.id ? { ...u, project_limit: updatedUser.project_limit } : u)));
        setEditingUser(null);
    };

    return (
        <div>
            {isCreateModalOpen && <CreateUserModal onClose={() => setIsCreateModalOpen(false)} onUserCreated={handleUserCreated} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onUserUpdated={handleUserUpdated} />}
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1><p className="text-gray-500 mt-1">Crea y administra los usuarios de la plataforma.</p></div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 flex items-center">
                    <PlusCircle className="mr-2" size={20} />Crear Nuevo Usuario
                </button>
            </div>
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-x-auto">
                 {loading ? (
                    <div className="p-10 text-center">Cargando usuarios...</div>
                ) : error ? (
                    <div className="p-10 text-center text-red-500">Error: {error}</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Límite Proyectos</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.project_limit}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-green-600"><Edit size={18} /></button>
                                        <button onClick={() => handleUserDeleted(user.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center p-8 text-gray-500">No hay usuarios creados.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
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
                        <div className="mb-6"><label className="block text-sm font-bold mb-2" htmlFor="password">Contraseña</label><input className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" id="password" type="password" placeholder="******************" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} /></div>
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
            case 'projects': return <ProjectsView user={user} />;
            case 'users': return <UsersView user={user} />;
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
};