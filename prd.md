problem statement - Belt Joint Rupture and Conveyor Belt Damages in Iron Ore Mining Industry: Intelligent Monitoring and Prediction of Conveyor Belt Joint Rupture and Damages in Iron Ore Mining Industry.

scope - 1. a home page which will contain basic details about project and guide about this web 
2.A dashboard which will contain all req elements
3.A specific alert page with all required componenets regarding this page(alerts will be with a specific reason for what failure can occur and why it will occur and how we can prevent that usinf GenAI also a RAG pipeline will be used for this which will be trained on all required things) no extra things which are not needed , this page wlll contain a log section which will maintain all logs(readings) ofr last 5 min and we can export that in form of excel sheet where normal readings will be in green and the reading which caused problems will be in red with timestamp.
4.A page which will show all trends and maintainance regarding stuff
5.A body double page with all required components.

out of scope - No auth page , No unncessary info , no role based system.

Target users - techincian in iron mine who moniotrs converyor belt

functional requirement-

1. we will fetch realtime sensor readings and fast photos  from firestore 
2.on readings we will use an isolation forest Ml model which will predict anomaly.also mongodb will store the reading of last 20 min and isloation forest will retrain itself on that readings after every 20 min and after successful training it will delete that data from db so db remains effeciant and optimized.
3. we will run acustom Yollov8 model to find defect in photos of coveryor belt , so this will give 2 o/p 1.basic yolloov8 o/p like what is problem in coveyor belt 2.a score like how much this will affect the system
4.We will calculate RUL(remaining useful life) so here we will calculate this on the basis of 1.isloation forest o/p 2.o/p of opencv model 3.includig readinngs (so here we are currently working on RUl logic like how can we crete a formula to do this)
5.A digital twin which will be created by readings and parameters which we are getting
6.A RAG so we will provide all info about project and machine and the type of anomalies and all req things related to this on the basis of that will generate genAI related alerts and daily report using genAI

Non functional req -

1.it should have a secure connection with firestore considering all necessary security 
2.it should be at minimal latency while fetching data and use resualble components to make it lighter
3.It should be reliable , there should be proper state management , proper validation of data also effective error handeling

Design / UX consideration -

1. this is not a noemal application this application for specfic indusrtial usecase so use should be accordingly no useless or unnecessary components also easy navigation and all req things for this usecase
2.in ui/ux Follow a react 4 layer architecture also use redux
3.for animations and all use gsap for smoother animations

Techincal condieration -

1.we will use pinecone for RAG
2.we will use MERN stack
3.we will use js based isolation forest 
4.yolov8 for cv
5. we will use REST api in backend with proper folder structure
6.for genai we will use langchain



