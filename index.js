const express=require("express");
const app=express();
const port=3000;
const path=require("path");
const mysql=require("mysql2");
const methodOverride=require("method-override");


//Middleware to fetch data
function fetchUserData(req, res, next) {
    const userId = req.params.id; // Extract user ID from route parameters
    if (!userId) {
        return res.status(400).send("User ID is required");
    }
    const q = `SELECT * FROM users WHERE id = ?`;
    connection.query(q, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user data:", err);
            return res.status(500).send("Database error");
        }
        if (results.length === 0) {
            return res.status(404).send("User not found");
        }
        req.user = results[0]; // Attach user data to the request
        next(); // Proceed to the next middleware or route handler
    });
}
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")))
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//connect the db
let connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Nickysport123!",
    database:"planit"
});

//Signup page
app.get("/",(req,res)=>{
    res.render("signin.ejs");

})
//Add detail to db
app.post("/signup",(req,res)=>{
    let{fname,lname,uname,dob,password,confirmpass}=req.body;
    if(password!==confirmpass){
        res.send("Wrong password");
    }
    else{
    let q=`insert into users(fname,lname,uname,dob,password) values(?,?,?,?,?)`;
    let user=[fname,lname,uname,dob,password];
    try{
        connection.query(q,user,(err,result)=>{
            if(err) throw err;
            console.log(result);
            res.redirect("/login");
        })
    }
    catch(err){
        res.send("Some error in the db");
    }
}
})

//Login page
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
//Login page verification
app.post("/login",(req,res)=>{
    let{uname,password}=req.body;
    let q=`select * from users where uname='${uname}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let info=result[0];
            if(password!=info.password){
                res.send("Incorrect password! Try again");
            }
            else{
                res.redirect(`/signup/${info.id}/home`);
            }
        })
    }
    catch(err){
        res.send("Some error in db");
    }
})

//home page
app.get("/signup/:id/home",(req,res)=>{
    let {id}=req.params;
    let q=`Select * from users where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            let data=result[0];
            res.render("home.ejs",{data});
        })
    }
    catch(err){
        res.send("Some error connecting to db");
    }
})
// profile display
app.get("/:id/profile",(req,res)=>{
    let {id}=req.params;
    let q=`select * from users where id=?`;
    connection.query(q,[id],(err,result)=>{
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching data");
        }
        let data=result[0];
        console.log(data);
        res.send(data); 
    })
})

//Logout option
app.get("/logout",(req,res)=>{
    res.redirect("/");
})


//task page 
app.get("/:userId/tasks/new", (req, res) => {
    const {userId} = req.params;
    const query = `
        SELECT c.category_id, c.category_name, t.task_id, t.task_name, t.due_date
        FROM categories c
        LEFT JOIN tasks t ON c.category_id = t.category_id
        WHERE c.user_id = ?;
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching data");
        }

        const categories = {};
        results.forEach(row => {
            const { category_id, category_name, task_id, task_name, due_date } = row;

            if (!categories[category_id]) {
                categories[category_id] = {
                    category_name,
                    tasks: [],
                };
            }

            if (task_id) {
                categories[category_id].tasks.push({
                    task_id,
                    task_name,
                    due_date,
                });
            }
        });

        res.render("task.ejs", { data: { id: userId}, categories });
    });
});

//add category
app.post("/:id/categories",fetchUserData,(req,res)=>{
    let {category_name}=req.body;
    const q=`insert into categories(category_name,user_id) values(?,?)`;
    connection.query(q,[category_name,req.user.id],(err,result)=>{
        if (err) return res.status(500).send(err);
        res.redirect(`/${req.user.id}/tasks/new`);
    })
})
//delete category
app.delete("/:id/categories/:category_id",fetchUserData,(req,res)=>{
    let {category_id}=req.params;
    const q=`Delete from categories where user_id=? and category_id=?`;
    connection.query(q,[req.user.id,category_id],(err,result)=>{
        if (err) {
            console.log(err);
            return res.status(500).send("Error deleting categort");
        }
        res.redirect(`/${req.user.id}/tasks/new`);
    })
})

//add  task
app.post("/:userId/tasks/:category_id", (req, res) => {
    let{category_id}=req.params;
    const {task_name, due_date } = req.body;
    // Validate input
    if (!task_name || !due_date) {
        return res.status(400).send("Invalid data provided");
    }
    // Save the task to the database (example code, adapt to your setup)
    let q="INSERT INTO tasks (category_id, task_name, due_date, user_id) VALUES (?, ?, ?, ?)";
    connection.query(q,[category_id, task_name, due_date, req.params.userId],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error adding task");
            }
            res.redirect(`/${req.params.userId}/tasks/new`);
        })
});



//delete task from db
app.delete("/:id/tasks/:taskId", fetchUserData, (req, res) => {
    const { taskId } = req.params; // Task ID to delete
    const q = `DELETE FROM tasks WHERE task_id = ? AND user_id = ?`;
    connection.query(q, [taskId, req.user.id], (err, result) => {
        if (err) return res.status(500).send("Database error");
        if (result.affectedRows === 0) return res.status(404).send("Task not found");
        res.redirect(`/${req.user.id}/tasks/new`);
    });
});

//calender page
app.get("/:id/calender", fetchUserData, (req, res) => {
    const q=`SELECT c.category_name, t.task_name, t.due_date
        FROM categories c
        LEFT JOIN tasks t ON c.category_id = t.category_id
        WHERE c.user_id = ?;`;
    connection.query(q, [req.user.id], (err, result) => {
        if (err) return res.status(500).send("Database error");
        if (result.affectedRows === 0) return res.status(404).send("Task not found");
        res.render("calender.ejs", { tasks: result,data:req.user});
    });
});



// Goals routes
app.get("/:id/goals/new", fetchUserData, (req, res) => {
    const q = `SELECT * FROM goals WHERE user_id = ?`;
    connection.query(q, [req.user.id], (err, results) => {
        if (err) return res.status(500).send("Database error");
        res.render("goals.ejs", { data: req.user, goals: results });
    });
});

app.post("/:id/goals", fetchUserData, (req, res) => {
    const { goal } = req.body;
    const q = `INSERT INTO goals(user_id, goal_name) VALUES (?, ?)`;
    connection.query(q, [req.user.id, goal], (err, result) => {
        if (err) return res.status(500).send("Database error");
        res.redirect(`/${req.user.id}/goals/new`);
    });
});

app.delete("/:id/goals/:goalId", fetchUserData, (req, res) => {
    const { goalId } = req.params;
    const q = `DELETE FROM goals WHERE goal_id = ? AND user_id = ?`;
    connection.query(q, [goalId, req.user.id], (err, result) => {
        if (err) return res.status(500).send("Database error");
        let id=
        res.redirect(`/${req.user.id}/goals/new`);
    });
});

// Habits routes
app.get("/:id/habits/new", fetchUserData, (req, res) => {
    const q = `SELECT * FROM habits WHERE user_id = ?`;
    connection.query(q, [req.user.id], (err, results) => {
        if (err) return res.status(500).send("Database error");
        res.render("habits.ejs", { data: req.user, habits: results });
    });
});

//add data to db
app.post("/:id/habits", fetchUserData, (req, res) => {
    const { habit } = req.body;
    const q = `INSERT INTO habits(user_id, habit_name) VALUES (?, ?)`;
    connection.query(q, [req.user.id, habit], (err, result) => {
        if (err) return res.status(500).send("Database error");
        res.redirect(`/${req.user.id}/habits/new`);
    });
});

//delete data from db
app.delete("/:id/habits/:habitId", fetchUserData, (req, res) => {
    const { habitId } = req.params;
    const q = `DELETE FROM habits WHERE habit_id = ? AND user_id = ?`;
    connection.query(q, [habitId, req.user.id], (err, result) => {
        if (err) return res.status(500).send("Database error");
        res.redirect(`/${req.user.id}/habits/new`);
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000/');
});


