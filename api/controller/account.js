import Account from "../model/account.js";

const createAccount = async (req, res) => {
    try {
        const {accountName, accountEmail, phoneNumber, employeeCode, location, dateOfBirth, anniversaryDate, status } = req.body;

        if (!accountName || !accountEmail) {
            return res.status(400).json({ status: 400, message: "Account name and email are required" });
        }

        const existingAccount = await Account.findOne({ accountEmail });
        if (existingAccount) {
            return res.status(400).json({ status: 400, message: "Account with this email already exists" });
        }

        const result = await Account.create({ accountName, accountEmail, phoneNumber, employeeCode, location, dateOfBirth, anniversaryDate, status });

        res.status(200).json({ status: 200, message: "Account created successfully", data: result });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error creating account", error: error.message });
    }
};

const bulkCreateAccount = async (req, res) => {
    try {
        const { data } = req.body;
        const result = await Account.insertMany(data);
        console.log(result)
        res.status(200).json({ status: 200, message: "Account created successfully", data: result });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error creating account", error: error.message });
    }
};


const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedAccount = await Account.findByIdAndUpdate( id, req.body, { new: true, runValidators: true } );

        if (!updatedAccount) {
            return res.status(404).json({ status: 404, message: "Account not found" });
        }

        res.status(200).json({ status: 200, message: "Account updated successfully", data: updatedAccount });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error updating account", error: error.message });
    }
};


const accountList = async (req, res) => {
  try {
    const { status } = req.query;

    const matchStage = {};
    if (status !== undefined) matchStage.status = status === "true";

    const today = new Date();

    const accounts = await Account.aggregate([
      { $match: matchStage },
      { $addFields: { birthMonth: { $month: "$dateOfBirth" }, birthDay: { $dayOfMonth: "$dateOfBirth" }, }, },

      {
        $addFields: {
          birthdayThisYear: {
            $dateFromParts: {
              year: { $year: today },
              month: "$birthMonth",
              day: "$birthDay",
            },
          },
        },
      },

      {
        $addFields: {
          nextBirthday: {
            $cond: [
              { $lt: ["$birthdayThisYear", today] },
              {
                $dateFromParts: {
                  year: { $add: [{ $year: today }, 1] },
                  month: "$birthMonth",
                  day: "$birthDay",
                },
              },
              "$birthdayThisYear",
            ],
          },
        },
      },

      {
        $addFields: {
          daysLeftForBirthday: {
            $ceil: {
              $divide: [
                { $subtract: ["$nextBirthday", today] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },

      { $sort: { daysLeftForBirthday: 1 } },
      {
        $project: {
          birthMonth: 0,
          birthDay: 0,
          birthdayThisYear: 0,
          nextBirthday: 0,
          __v: 0,
        },
      },
    ]);

    res.status(200).json({
      status: 200,
      message: "Account list fetched successfully",
      data: accounts,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error fetching account list",
      error: error.message,
    });
  }
};


const deleteAccount = async (req, res) => {
    try {
        const selectedIds = req.body; // Expecting an array of IDs to delete
        const deletedAccount = await Account.deleteMany({ _id: { $in: selectedIds } });
        res.status(200).json({ status: 200, message: "Accounts deleted successfully", data: deletedAccount });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error deleting activities", error: error.message });
    }
}   



export { createAccount, bulkCreateAccount, updateAccount, accountList, deleteAccount };