export default class Avatar {
    canvas = null
    ctx = null
    // 头像原图
    image = null
    // 头像大小
    size = null
    // 遮罩配置
    mask = null
    // 头像坐标
    points = []
    // 背景颜色
    color = ''
  // 绘画配置
    option = {
      origin: {x: 0, y: 0},
      touch1: null,
      touch2: null,
      scale: 1
    }
    constructor (canvas, config = {}) {
      this.canvas = canvas
      canvas.that = this
      this.ctx = canvas.getContext('2d')
      this._init(config)
    }
  
    _init (config) {
      let width = this.canvas.width = config.width ? config.width : this.canvas.width
      let height = this.canvas.height = config.height ? config.height : this.canvas.width * 1
      let size = this.size = config.size || width * 0.5
      this.points = config.points || [
          { x: (width - size) / 2, y: (height - size) / 2 },
          { x: (width + size) / 2, y: (height - size) / 2 },
          { x: (width + size) / 2, y: (height + size) / 2 },
          { x: (width - size) / 2, y: (height + size) / 2 }
      ]
      this.mask = config.mask || {
        color: 'rgba(0, 0, 0, .4)'
      }
      this.color = config.color || '#f6f7f8'
      this.ctx.fillStyle = '#f6f7f8'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  
    _setImgage (url) {
      this.image = new Image()
      this.image.src = url
      this.image.crossOrigin = 'anonymous'
      return new Promise((resolve, reject) => {
        this.image.onload = function () {
          resolve(this.image)
        }
        this.image.onerror = function () {
          reject(new Error('加载图片出错'))
        }
      })
    }
  
    _drawMask () {
      this.ctx.fillStyle = this.mask.color
      this.ctx.beginPath()
      this.ctx.rect(0, 0, this.canvas.width, this.points[0].y)
      this.ctx.rect(0, this.points[3].y, this.canvas.width, this.canvas.height - this.points[3].y)
      this.ctx.rect(0, this.points[0].y, this.points[0].x, this.size)
      this.ctx.rect(this.points[1].x, this.points[1].y, this.points[0].x, this.size)
      this.ctx.fill()
    }
  
    _drawStoke () {
      this.ctx.setLineDash([6, 3])
      this.ctx.strokeStyle = '#fff'
      this.ctx.strokeRect(this.points[0].x - 3, this.points[0].y - 3, this.size + 6, this.size + 6)
    }
  
    _addEvent () {
      if (!this.image) return
      this.canvas.ontouchstart = this.canvas.ontouchstart || this.moveEventStart
      this.canvas.ontouchmove = this.canvas.ontouchmove || this.moveEventDoing
      this.canvas.ontouchend = this.canvas.ontouchend || this.moveEventEnd
    }
  
    async setImage (src) {
      if (!src) return
      await this._setImgage(src)
      this.image.width >= this.image.height
      ? this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.image.height * this.canvas.width / this.image.width)
      : this.ctx.drawImage(this.image, 0, 0, this.image.width * this.canvas.height / this.image.height, this.canvas.height)
      this._drawMask()
      this._drawStoke()
      this._addEvent()
    }
  
    resetCanvas () {
      this.ctx.fillStyle = this.color
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this._drawMask()
      this._drawStoke()
    }
  
    exportAvatar () {
      let canvas = document.createElement('canvas')
      canvas.width = canvas.height = this.size
      let ctx = canvas.getContext('2d')
      ctx.drawImage(this.image,
         this.option.origin.x - (this.canvas.width - this.size) / 2,
         this.option.origin.y - (this.canvas.height - this.size) / 2,
         this.canvas.width * this.option.scale,
         (this.image.height * this.canvas.width / this.image.width) * this.option.scale)
      return canvas.toDataURL('image/png')
    }
  
    destroyed () {
      this.canvas.ontouchstart = null
      this.canvas.ontouchmove = null
      this.canvas.ontouchend = null
      this.canvas = null
    }
  
    moveEventStart (e) {
      e.stopPropagation()
      e.preventDefault()
      const vm = e.target.that
      if (e.touches.length === 1) {
        vm.option.touch1 = {x: e.touches[0].pageX, y: e.touches[0].pageY}
      }
      if (e.touches.length === 2) {
        vm.option.scale0 = Math.sqrt((e.touches[1].pageX - e.touches[0].pageX) ** 2 + (e.touches[1].pageY - e.touches[0].pageY) ** 2)
      }
    }
    moveEventDoing (e) {
      const vm = e.target.that
      if (e.touches.length === 1) {
        vm.option.touch2 = {x: e.touches[0].pageX, y: e.touches[0].pageY}
        vm.option.origin = {x: vm.option.origin.x - vm.option.touch1.x + vm.option.touch2.x, y: vm.option.origin.y - vm.option.touch1.y + vm.option.touch2.y}
        vm.ctx.clearRect(0, 0, vm.canvas.width, vm.canvas.height)
        vm.ctx.fillStyle = '#f6f7f8'
        vm.ctx.fillRect(0, 0, vm.canvas.width, vm.canvas.height)
        vm.ctx.drawImage(vm.image, vm.option.origin.x, vm.option.origin.y, vm.canvas.width * vm.option.scale, (vm.image.height * vm.canvas.width / vm.image.width) * vm.option.scale)
        vm._drawMask()
        vm._drawStoke()
        vm.option.touch1 = vm.option.touch2
        vm.option.scale0 = null
      }
      if (e.touches.length === 2) {
        // console.warn('缩放')
        if (vm.option.scale0) {
          vm.option.scale1 = Math.sqrt((e.touches[1].pageX - e.touches[0].pageX) ** 2 + (e.touches[1].pageY - e.touches[0].pageY) ** 2)
          vm.option.scale = vm.option.scale1 / vm.option.scale0
          vm.ctx.clearRect(0, 0, vm.canvas.width, vm.canvas.height)
          vm.ctx.fillStyle = '#f6f7f8'
          vm.ctx.fillRect(0, 0, vm.canvas.width, vm.canvas.height)
          vm.ctx.drawImage(vm.image, vm.option.origin.x, vm.option.origin.y, vm.canvas.width * vm.option.scale, (vm.image.height * vm.canvas.width / vm.image.width) * vm.option.scale)
          vm._drawMask()
          vm._drawStoke()
        }
      }
    }
    moveEventEnd (e) {
      const vm = e.target.that
      vm.option.scale0 = null
      vm.option.scale1 = null
    }
  }
  