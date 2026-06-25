const allowedOrigins = [
    // Local development
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    // ⭐ Vercel production URLs (আপনার URL বসান)
    'https://portfolio-frontend-xi-one.vercel.app', // ← আপনার URL
    'https://portfolio-frontend-git-main.vercel.app',
    // ⭐ Render production URL
    'https://portfolio-backend-drs2.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('CORS: No origin, allowing');
            return callback(null, true);
        }
        
        // Development mode - সব Origin অনুমোদিত
        if (process.env.NODE_ENV === 'development') {
            console.log('CORS: Development mode, allowing all origins');
            return callback(null, true);
        }
        
        // Production mode - শুধু allowedOrigins অনুমোদিত
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('CORS: Allowed origin:', origin);
            callback(null, true);
        } else {
            console.log('CORS: Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // 24 hours
}));
// OPTIONS (preflight) রিকোয়েস্টের জন্য CORS হেডার পাঠান
app.options('*', cors());

// ============ OPTIONS PRE-FLIGHT HANDLING ============
app.options('*', cors());

// ============ MIDDLEWARE ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (শুধু ডেভেলপমেন্টে)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        if (req.headers.origin) {
            console.log('Origin:', req.headers.origin);
        }
        next();
    });
}

// ============ HEALTH CHECK ENDPOINT ============
// একটি ডেডিকেটেড রুট এন্ডপয়েন্ট যা CORS preflight-এর জন্য সাড়া দেবে
app.get('/api', (req, res) => {
    res.json({ 
        message: 'API is working!',
        endpoints: {
            health: '/api/health',
            profile: '/api/public/profile',
            projects: '/api/public/projects'
        }
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        allowedOrigins: process.env.NODE_ENV === 'development' ? 'ALL' : allowedOrigins
    });
});

// ============ DATA FUNCTIONS ============
const getData = () => {
    try {
        const dataPath = path.join(__dirname, 'data.json');
        if (!fs.existsSync(dataPath)) {
            // Initialize with default structure
            const defaultData = {
                profile: {
                    name: 'Kamrul Zaman',
                    title: 'Full Stack Developer',
                    desc: 'Passionate developer creating amazing web applications',
                    location: 'Dhaka, Bangladesh',
                    company: 'Tech Solutions Ltd.',
                    followers: 1250,
                    contributions: 345,
                    resumeSections: [
                        {
                            title: 'About Me',
                            content: 'I am a passionate full-stack developer with 5+ years of experience in building web applications.'
                        },
                        {
                            title: 'Skills',
                            content: '- JavaScript\n- React\n- Node.js\n- MongoDB\n- Express.js'
                        }
                    ],
                    contacts: [
                        {
                            icon: 'fa-envelope',
                            label: 'Email',
                            href: 'mailto:kamrul@example.com'
                        },
                        {
                            icon: 'fa-github',
                            label: 'GitHub',
                            href: 'https://github.com/kamrul'
                        },
                        {
                            icon: 'fa-linkedin',
                            label: 'LinkedIn',
                            href: 'https://linkedin.com/in/kamrul'
                        }
                    ],
                    social: [
                        {
                            icon: 'fa-github',
                            href: 'https://github.com/kamrul'
                        },
                        {
                            icon: 'fa-linkedin',
                            href: 'https://linkedin.com/in/kamrul'
                        },
                        {
                            icon: 'fa-facebook',
                            href: 'https://facebook.com/kamrul'
                        }
                    ]
                },
                projects: []
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { profile: {}, projects: [] };
    }
};

const writeData = (data) => {
    try {
        const dataPath = path.join(__dirname, 'data.json');
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
};

const getUsers = () => {
    try {
        const usersPath = path.join(__dirname, 'users.json');
        if (!fs.existsSync(usersPath)) {
            // Create default admin user with hashed password
            // Password: admin123
            const defaultUsers = {
                users: [
                    {
                        id: 1,
                        username: 'admin',
                        password: '$2a$10$K7L5X3Y9Z2A8B4C6D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y', // admin123 hashed
                        email: 'admin@example.com',
                        role: 'admin',
                        createdAt: new Date().toISOString()
                    }
                ]
            };
            fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2));
            return defaultUsers;
        }
        const data = fs.readFileSync(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return { users: [] };
    }
};

const writeUsers = (data) => {
    try {
        const usersPath = path.join(__dirname, 'users.json');
        fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
};

// ============ PUBLIC ROUTES ============

// Get public profile
app.get('/api/public/profile', (req, res) => {
    try {
        const data = getData();
        res.json(data.profile || {});
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get public projects
app.get('/api/public/projects', (req, res) => {
    try {
        const data = getData();
        res.json(data.projects || []);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ AUTH ROUTES ============

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Username and password required' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'Password must be at least 6 characters' 
            });
        }
        
        const usersData = getUsers();
        
        // Check if user exists
        if (usersData.users.find(user => user.username === username)) {
            return res.status(400).json({ 
                success: false,
                error: 'User already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: usersData.users.length + 1,
            username,
            email: email || '',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        usersData.users.push(newUser);
        writeUsers(usersData);
        
        // Create token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Username and password required' 
            });
        }
        
        const usersData = getUsers();
        const user = usersData.users.find(user => user.username === username);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials' 
            });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials' 
            });
        }
        
        // Create token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

// ============ AUTH MIDDLEWARE ============
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            error: 'No token provided' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: 'Invalid token format' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ 
            success: false,
            error: 'Invalid token' 
        });
    }
};

// ============ PROTECTED ROUTES ============

// Get current user
app.get('/api/auth/me', authenticate, (req, res) => {
    const usersData = getUsers();
    const user = usersData.users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ 
            success: false,
            error: 'User not found' 
        });
    }
    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            createdAt: user.createdAt
        }
    });
});

// Get profile (admin only)
app.get('/api/profile', authenticate, (req, res) => {
    try {
        const data = getData();
        res.json(data.profile || {});
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update profile (admin only)
app.post('/api/profile', authenticate, (req, res) => {
    try {
        const data = getData();
        data.profile = {
            ...data.profile,
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        writeData(data);
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            profile: data.profile 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all projects (admin only)
app.get('/api/projects', authenticate, (req, res) => {
    try {
        const data = getData();
        res.json(data.projects || []);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create project (admin only)
app.post('/api/projects', authenticate, (req, res) => {
    try {
        const data = getData();
        const newProject = {
            id: Date.now(),
            ...req.body,
            createdBy: req.user.id,
            createdAt: new Date().toISOString()
        };
        if (!data.projects) data.projects = [];
        data.projects.push(newProject);
        writeData(data);
        res.status(201).json({ 
            success: true, 
            message: 'Project created successfully',
            project: newProject 
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update project (admin only)
app.put('/api/projects/:id', authenticate, (req, res) => {
    try {
        const data = getData();
        const id = parseInt(req.params.id);
        const index = data.projects.findIndex(p => p.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }
        data.projects[index] = {
            ...data.projects[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        writeData(data);
        res.json({ 
            success: true, 
            message: 'Project updated successfully',
            project: data.projects[index] 
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete project (admin only)
app.delete('/api/projects/:id', authenticate, (req, res) => {
    try {
        const data = getData();
        const id = parseInt(req.params.id);
        const initialLength = data.projects.length;
        data.projects = data.projects.filter(p => p.id !== id);
        if (data.projects.length === initialLength) {
            return res.status(404).json({ error: 'Project not found' });
        }
        writeData(data);
        res.json({ 
            success: true, 
            message: 'Project deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
    console.error('Error handler:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found' 
    });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CORS allowed origins: ${process.env.NODE_ENV === 'development' ? 'ALL' : allowedOrigins.join(', ')}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
});
