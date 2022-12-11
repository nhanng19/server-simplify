const User = require('./User');
const Note = require('./Note');
const Keyword = require('./Keyword')

User.hasMany(Note, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Note.hasMany(Keyword, {
  onDelete: 'CASCADE'
})

Note.belongsTo(User, {
  foreignKey: 'user_id'
});

Keyword.belongsTo(Note, {
  foreignKey: "note_id"
})

Keyword.belongsTo(User, {
  foreignKey: "user_id",
});


module.exports = { User, Note, Keyword };