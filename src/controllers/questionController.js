function createQuestion(req, res){
    console.log('create question')
}

function showCreateForm (req, res){
    res.render('admin/create-quiz');

}
module.exports = { showCreateForm, createQuestion};