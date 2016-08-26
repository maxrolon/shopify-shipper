export default () => {
	return {
		isLocked:false,
		register:function(...els){
			this.els = els
		},
		lock:function(){
			for (let i=0; i < this.els.length; i++){
				this.els[i].disabled = true
			}
			this.isLocked = true;
		},
		unLock:function(){
			for (let i=0; i < this.els.length; i++){
				this.els[i].disabled = false
			}
			this.isLocked = false;
		}
	}
}
