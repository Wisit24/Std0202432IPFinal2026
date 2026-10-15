const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let employees = [
  { id: 1, name: 'Alice Smith', position: 'Software Engineer', salary: 85000, isActive: true },
  { id: 2, name: 'Bob Jones', position: 'Senior Developer', salary: 110000, isActive: true },
  { id: 3, name: 'Charlie Brown', position: 'Product Manager', salary: 125000, isActive: true },
  { id: 4, name: 'David Miller', position: 'UI/UX Designer', salary: 75000, isActive: true },
  { id: 5, name: 'Eva Davis', position: 'Data Scientist', salary: 95000, isActive: true },
  { id: 6, name: 'Frank White', position: 'CTO', salary: 210000, isActive: true },
  { id: 7, name: 'Grace Wilson', position: 'Junior Developer', salary: 45000, isActive: true },
  { id: 8, name: 'Hannah Taylor', position: 'HR Manager', salary: 65000, isActive: true }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({ success: true, token: 'luxury-jwt-token' });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/employees', (req, res) => res.json(employees));

app.post('/api/employees', (req, res) => {
  const { name, position, salary } = req.body;
  const newEmp = {
    id: employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1,
    name, position, salary: Number(salary), isActive: true
  };
  employees.push(newEmp);
  res.status(201).json(newEmp);
});

app.put('/api/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, position, salary } = req.body;
  const idx = employees.findIndex(e => e.id === id);
  if (idx !== -1) {
    employees[idx] = { ...employees[idx], name, position, salary: Number(salary) };
    return res.json(employees[idx]);
  }
  res.status(404).json({ message: 'Not found' });
});

app.patch('/api/employees/:id/toggle', (req, res) => {
  const emp = employees.find(e => e.id === parseInt(req.params.id));
  if (emp) {
    emp.isActive = !emp.isActive;
    return res.json(emp);
  }
  res.status(404).json({ message: 'Not found' });
});

app.delete('/api/employees/:id', (req, res) => {
  employees = employees.filter(e => e.id !== parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

app.get('/api/analytics/kmeans', (req, res) => {
  const active = employees.filter(e => e.isActive);
  if (!active.length) return res.json([]);
  
  const salaries = active.map(e => e.salary).sort((a, b) => a - b);
  let centroids = [salaries[0], salaries[Math.floor(salaries.length / 2)], salaries[salaries.length - 1]];
  let clusters = [[], [], []];

  for (let iter = 0; iter < 5; iter++) {
    clusters = [[], [], []];
    active.forEach(emp => {
      let closest = 0;
      let minDiff = Math.abs(emp.salary - centroids[0]);
      [1, 2].forEach(i => {
        const diff = Math.abs(emp.salary - centroids[i]);
        if (diff < minDiff) { minDiff = diff; closest = i; }
      });
      clusters[closest].push(emp);
    });

    centroids = clusters.map((c, i) => c.length ? Math.round(c.reduce((sum, e) => sum + e.salary, 0) / c.length) : centroids[i]);
  }

  res.json([
    { tierName: 'Tier 1 (Base Range)', centroid: centroids[0], members: clusters[0] },
    { tierName: 'Tier 2 (Mid Range)', centroid: centroids[1], members: clusters[1] },
    { tierName: 'Tier 3 (Executive Range)', centroid: centroids[2], members: clusters[2] }
  ]);
});

app.listen(3000, () => console.log('Backend running on http://localhost:3000'));