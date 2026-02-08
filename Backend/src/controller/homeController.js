import customerService from "../service/customerService";

const handleHelloworld = (req, res) => {
    const name = "Alex";
    return res.render("home.ejs", { name });
};



const handleCreateNewUser = async (req, res) => {
    try {
        await customerService.createUser(req.body);
        return res.redirect("/user");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Create user failed");
    }
};
const handleUser = async (req, res) => {
    try {
        const users = await customerService.getAllUsers();
        return res.render("user.ejs", { users });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Load users failed");
    }
};

const handleDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await customerService.deleteUser(id);
        return res.redirect("/user");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Delete user failed");
    }
};

const handleEditUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await customerService.getUserById(id);
        return res.render("user-edit.ejs", { user });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Load edit user failed");
    }
};

const handleUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await customerService.updateUser(id, req.body);
        return res.redirect("/user");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Update user failed");
    }
};

module.exports = {
    handleHelloworld,
    handleUser,
    handleCreateNewUser,
   handleDeleteUser,
   handleEditUser,
   handleUpdateUser
};
