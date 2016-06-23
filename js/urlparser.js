var urlparser = (function() {
    /** Get url data and store it in the app context */
    function get(u){
    /*jshint evil:true */
        var re = /^([1-9]\d*\.?\d+|true|false|null|0\.\d+)$/;

        // If a URL is passed use that, use the location hash otherwise
        u = u ? u : location.search.substr(1);
        if(u){
            var result = {};
            u.split("&").forEach(function(part) {
                var item = part.split("=");
                var val = decodeURIComponent(item[1])
                if(val){
                    if (re.test(val)) {
                        result[item[0]] = eval(val);
                    }
                    else {
                        result[item[0]] = val;
                    }
                }
                else {
                    result[item[0]] = null;
                }
            });
        }
        return result;
    }

    return {
        get: get
    };
})();
