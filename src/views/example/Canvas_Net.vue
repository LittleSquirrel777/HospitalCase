<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <!-- import CSS -->
  <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
  <style>
    #mynetwork {
		width: 100%;
		height: 500px;
		border: 1px solid lightgray;
	}
	canvas{
		cursor: pointer;
	}
  </style>
</head>
<body>
  <div id="app">
    <div>
		<div>
			<p>1.自定义节点-使用canvas画布，canvas画布位置所画的位置需要随着节点移动而移动。2.范围虚线框-canvas画布，虚线框需要随着画布的移动，改变位置与大小</p>
		</div>
        <div id="mynetwork"></div>
     </div>
  </div>
</body>
  <!-- vis-network -->
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <!-- import Vue before Element -->
  <script src="https://unpkg.com/vue/dist/vue.js"></script>
  <!-- import JavaScript -->
  <script src="https://unpkg.com/element-ui/lib/index.js"></script>
  <script>
    new Vue({
      el: '#app',
		data() {
			//vis位置以中心算的，首先明确0,0位置，设置坐标会自动做出画布调整
			return {
				nodes : [
					{
						id: 1,
						isTogether:true,
						label: "这里可以\n换行显示字",
						x: -400, // 位置以中心算的
						y: 0 , // 位置
						shape: 'circularImage',
						image:'./qq.jpg',
						size:80,// 大小
						title:'伏哥',  //鼠标悬停效果
					},
					{
						id: 2,
						isTogether:true,
						x: 0,
						y: 0,
						shape: 'custom',
						ctxRenderer:function ctxRenderer(e){
						// console.log('123',e.x,e.y) // 这里的数据是外边分配数据，我们在这函数里要自定义，包括坐标大小形状，字体
							const { ctx } = e
							return {
								drawNode() {
									ctx.beginPath()
									ctx.fillStyle = "yellow";
									ctx.arc(e.x,e.y,50,0,Math.PI*2,true); // 脸
									ctx.fill()
									ctx.stroke();

									ctx.beginPath()
									ctx.fillStyle = "yellow";
									ctx.moveTo(e.x+35,e.y+0);
									ctx.arc(e.x,e.y,35,0,Math.PI,false); // 嘴巴
									ctx.fill()
									ctx.stroke();

									ctx.beginPath()
									ctx.moveTo(e.x-15,e.y-15);
									ctx.fillStyle = "black";
									ctx.arc(e.x-15,e.y-15,10,0,Math.PI*2,true); // 眼睛
									ctx.moveTo(e.x+15,e.y-15);
									ctx.arc(e.x+15,e.y-15,10,0,Math.PI*2,true); // 眼睛
									ctx.fill()
									ctx.stroke();
								},
								drawExternalLabel() {
									ctx.strokeText( "画出笑脸", e.x-30, e.y+70 );    //写lable文字
								},
								nodeDimensions: { width:100, height:100 }, //告诉画布 你画出图形胡范围多大
							};
						},
						title:'canvas笑脸',
					},
					{
						id: 3,
						isTrue:true,
						font: { multi: "html", size: 20 },
						label: "<b>这</b>是一只\n<i>html</i><code>木星</code>",
						x: 300,
						y: -160,
						shape: 'circularImage',
						image:'./ww.jpg',
						size:32,
						title:'奥华',
					},
					{
						id: 4,
						isTrue:true,
						font: { multi: "md", face: "georgia" },
						label: "markdown",
						x: 300,
						y: -50,
						shape: 'circularImage',
						image:'./ee.jpg',
						size:24,
						title:'张锋',
					},
					{
						id: 5,
						isTrue:true,
						font: { multi: "md", face: "georgia", },
						label: "*这*是一只\n`地球`",
						x: 300,
						y: 50,
						shape: 'circularImage',
						image:'./rr.jpg',
						size:20,
						title:'国武',
					},
					{
						id: 6,
						isTrue:true,
						font: { multi: "md", face: "georgia", },
						label: "*这* 是一只 `地球`",
						x: 300,
						y: 160,
						size:10,
						shape: 'circularImage',
						image:'./tt.jpg',
						title:'宗怡',
					},
				],
				edges : [
					{ from: 1, to: 2, label: "single to default" },
					{ from: 2, to: 3, font: { multi: true }, label: "default to <b>html</b>" },
					{ from: 2, to: 4, font: { multi: "md" }, label: "*html* _to_ _md_" },
					{ from: 2, to: 5, font: { multi: "md" }, label: "*html* to _md_" },
					{ from: 2, to: 6, font: { multi: "md" }, label: "*html* to _md_" },
				],
				options: {},
			}
        },
		mounted(){
				this.init();
		},
        methods:{
			init(){
				var container = document.getElementById("mynetwork");
				var data = {
					nodes: this.nodes,
					edges: this.edges,
				};
				this.options = {
					edges: {
						width: 1,
						length: 60,
						shadow: true,
						smooth: {
							enabled: true, // 设置连线是直线还是湾线还是贝塞尔
							type:'cubicBezier' // 'dynamic', 'continuous', 'discrete', 'diagonalCross', 'straightCross', 'horizontal', 'vertical', 'curvedCW', 'curvedCCW', 'cubicBezier'
						},
						arrows: {
							to: {
							enabled: true,
							scaleFactor: 1,
							type: "arrow"
							},
							},
						color: {
							color: "#bc68e6",
							highlight: "yellow",
							hover: "#1fe1c6",
							inherit: "from",
							opacity: 1.0
						},
						font: {
							color: 'yellow',
							size: 14,
							face: 'arial',
							background: 'white',
							strokeWidth: 2,
							strokeColor: 'rgb(112, 184, 240)',
							align: 'horizontal',
							multi: false,
							vadjust: 0,
							bold: {
							color: "green",
							},
						},
					},
					nodes: {
						font: {
						bold: {
							color: "red",
						},
						},
					},
					physics: {
						enabled: false,
					},
					interaction: {
					dragNodes: true, //是否能拖动节点
					dragView: true, //是否能拖动画布
					hover: true, //鼠标移过后加粗该节点和连接线
					multiselect: false, //按 ctrl 多选
					selectable: false, //是否可以点击选择
					selectConnectedEdges: false, //选择节点后是否显示连接线
					hoverConnectedEdges: false, //鼠标滑动节点后是否显示连接线
					zoomView: true //是否能缩放画布
				},
				};
				this.network = new vis.Network(container, data,  this.options);
				// 绘制network的钩子
				// this.network.on("initRedraw", function () {console.log(1)});
				this.network.on("beforeDrawing", (ctx) => {
					// console.log(this.network.getScale()) // 放大缩小倍数
					this.isDrowGaphical(ctx,this.isDrowPosition('isTrue'),this.getPositionWidth('isTrue'))
					this.isDrowGaphical(ctx,this.isDrowPosition('isTogether'),this.getPositionWidth('isTogether'))
				});
				// this.network.on("afterDrawing", function (ctx) {console.log(1)});
			},
			// 获取符合的虚线框的范围
			isDrowPosition(opt){
				let PositionArr = []
				this.nodes.forEach(element => {
						if(element[opt]) {
							PositionArr.push(element.id)
						}
					});
				let isPosiObj = this.network.getPositions(PositionArr) // 获取位置信息
				let NewObj = {maxX:null,minX:null,maxY:null,minY:null}
				for(var item in isPosiObj) {
					// console.log(isPosiObj[item])
					if (isPosiObj[item].x > NewObj.maxX || NewObj.maxX == null) NewObj.maxX = isPosiObj[item].x
					if (isPosiObj[item].x < NewObj.minX || NewObj.minX == null) NewObj.minX = isPosiObj[item].x
					if (isPosiObj[item].y > NewObj.maxY || NewObj.maxY == null) NewObj.maxY = isPosiObj[item].y
					if (isPosiObj[item].y < NewObj.minY || NewObj.minY == null) NewObj.minY = isPosiObj[item].y
				}
				return NewObj
			},
			// 获取符合条件的最大宽度与高度
			getPositionWidth(opt){
				let removeX = 0
				let removeY = 0
				this.nodes.forEach(ele => {
					if(ele[opt]) {
						let obj = this.network.getBoundingBox(ele.id)
						if(removeX < (obj.right - obj.left)/2+10){
							removeX = (obj.right - obj.left)/2+10
						}
						if(removeY < (obj.bottom - obj.top)/2+10){
							removeY = (obj.bottom - obj.top)/2+10
						}
					}
				})
				return {
					removeX,
					removeY
				}
			},
			// 画出虚线框
			isDrowGaphical(ctx,obj,SafeArea){
				// 最小x 最小y => 最大x 最小y  => 最大x 最大y => 最小x 最大y
				ctx.save(); // 这里的坑 影响了之前的所有线都成为了虚线
				ctx.beginPath();
				ctx.strokeStyle='#aaa'
				ctx.setLineDash([10,10]);
				ctx.moveTo(obj.minX-SafeArea.removeX,obj.minY-SafeArea.removeY);
				ctx.lineTo(obj.maxX+SafeArea.removeX,obj.minY-SafeArea.removeY);
				ctx.lineTo(obj.maxX+SafeArea.removeX,obj.maxY+SafeArea.removeY);
				ctx.lineTo(obj.minX-SafeArea.removeX,obj.maxY+SafeArea.removeY);
				ctx.closePath();
				ctx.stroke();
				ctx.restore();
			},
		}
    })
  </script>
</html>
