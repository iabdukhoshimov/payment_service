module.exports = {
    SUCCESS: {
        "error": 0,
        "error_note": "Success"
    },

    SIGN_CHECK_FAILED: {
        "error": -1,
        "error_note": "SIGN CHECK FAILED!"
    },

    INCORRECT_AMOUNT: {
        "error": -2,
        "error_note": "Incorrect parameter amount"
    },

    ACTION_NOT_FOUND: {
        "error": -3,
        "error_note": "Action not found"
    },

    ALREADY_PAID: {
        "error": -4,
        "error_note": "Already paid"
    },

    USER_NOT_EXISTS: {
        "error": -5,
        "error_note": "User does not exist"
    },

    TRANSACTION_NOT_FOUND: {
        "error": -6,
        "error_note": "Transaction does not exist"
    },

    FAILED_TO_UPDATE_USER: {
        "error": -7,
        "error_note": "Failed to update user"
    },

    ERROR_IN_REQUEST: {
        "error": -8,
        "error_note": "Error in request from click"
    },

    TRANSACTION_CANCELLED: {
        "error": -9,
        "error_note": "Transaction cancelled"
    }
}