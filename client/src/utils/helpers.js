/**
 * Generates initials from a given name or email.
 * @param {string} name - The user's name or email.
 * @returns {string} - The first letter capitalized.
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};
