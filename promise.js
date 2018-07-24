Promise.resolve()
.then(()=>{
    Promise.reject(123)
    throw (123)
})
.then(res=>{
    console.log("then:",res)
    process.exit(0)
})
.catch(e=>{
    console.log("catch:",e)
    process.exit(1)
})