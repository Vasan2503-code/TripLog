
const Trip = require("../models/Trip")

const User = require("../models/User");

const createTrip = async (req, res) => {
    try {
        const { title, description, date, destination } = req.body;
        const newTrip = new Trip({
            title,
            description,
            date,
            destination,
            createdBy: req.user.id
        })
        await newTrip.save();
        res.status(201).send({ message: "Trip Created Successfully", newTrip });
    } catch (e) {
        res.status(500).send({ message: "Server side error", error: e.message });
    }
}

const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, destination } = req.body;
        const trip = await Trip.findById(id);
        if (!trip) {
            return res.status(404).send({ message: "Trip not found" });
        }
        if (trip.createdBy.toString() !== req.user.id) {
            return res.status(403).send({ message: "User not Authorized to update this trip" });
        }
        if (title) trip.title = title;
        if (description) trip.description = description;
        if (date) trip.date = date;
        if (destination) trip.destination = destination;
        await trip.save();
        res.status(200).send({ message: "Trip Updated successfully", trip });
    } catch (e) {
        res.status(500).send({ message: "Server side error", error: e.message });
    }
}

const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const curTrip = await Trip.findOne({ _id: id });
        if (curTrip.createdBy.toString() !== req.user.id) {
            return res.status(403).send({ message: "User not authorized to delete this trip" });
        }
        if (!curTrip) {
            return res.status(400).send({ message: "Trip not found" });
        }
        await Trip.deleteOne({ _id: id });
        res.status(200).send({ message: "Trip deleted successfully" });
    }
    catch (e) {
        res.status(500).send({ message: "Server side error ", e })
    }
}

const addMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const trip = await Trip.findById(id);

        if (!trip) {
            return res.status(400).send({ message: "Trip not found" });
        }
        if (trip.createdBy.toString() !== req.user.id) {
            return res.status(400).send({ message: "Only Admin can add Members" });
        }

        const curUser = await User.findOne({ email });

        if (!curUser) {
            return res.status(400).send({ message: "User not found" });
        }
        if (trip.members.some(member => member.equals(curUser._id))) {
            return res.status(400).send({ message: "User already a member" });
        }

        trip.members.push(curUser._id);
        await trip.save();
        res.status(200).send({ message: "Member added successfully", trip });

    } catch (e) {
        res.status(500).send({ message: "Server side error ", e })
    }
}

const deleteMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const trip = await Trip.findById(id);

        if (!trip) {
            return res.status(400).send({ message: "Trip not found" });
        }
        if (trip.createdBy.toString() !== req.user.id) {
            return res.status(400).send({ message: "Only Admin can remove Members" });
        }

        const curUser = await User.findOne({ email });

        if (!curUser) {
            return res.status(400).send({ message: "User not found" });
        }
        if (!trip.members.some(member => member.equals(curUser._id))) {
            return res.status(400).send({ message: "User is not a member" });
        }

        trip.members.pull(curUser._id);
        await trip.save();
        res.status(200).send({ message: "Member removed successfully", trip });

    } catch (e) {
        res.status(500).send({ message: "Server side error ", e })
    }
}

const getAllMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await Trip.findById(id).populate("members", "name");
        if (!trip) {
            return res.status(400).send({ message: "Trip not found" });
        }
        if (trip.createdBy.toString() !== req.user.id) {
            return res.status(400).send({ message: "User not authorized to get members" });
        }
        res.status(200).send({ message: "Members fetched successfully", members: trip.members });
    } catch (e) {
        res.status(500).send({ message: "Server side error ", e })
    }
}

module.exports = { createTrip, updateTrip, deleteTrip, addMembers, deleteMembers, getAllMembers };