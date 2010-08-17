//----------------------------------------------------------------------------
// addition for modjewels
//----------------------------------------------------------------------------

if (!Object.keys) {
    Object.keys = function(object) {
        var array = []
        for (var key in object)
            if (object.hasOwnProperty(key)) array.push(key)
        return array
    }
}