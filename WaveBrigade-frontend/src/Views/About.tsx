import Divider from "@heroui/divider";
import NavigationBar from "../Components/NavigationBar";
//Make responsive??
export default function About() {
    return (
    <div className="container mx-auto mb-10">
        <div className="text-center mt-10">
            <h1 className="text-5xl pb-3">WaveBrigade</h1>
            <p >University of Nevada, Reno</p>
            <p>Department of Computer Science & Engineering</p>
            <p>CS 426: Senior Projects in Computer Science</p>
            <p>Spring 2025</p>
            <h4 className="text-lg font-semibold mt-4">Team 09 Members</h4>
            <p>Sebastian Andrade, Haley Marquez, Emanuelle Pelayo </p>
            <h4 className="text-lg font-semibold mt-4">Instructors</h4>
            <p>David Feil-Seifer, Department of Computer Science, UNR </p>
            <p>Sara Davis, Department of Computer Science, UNR </p>
            <h4 className="text-lg font-semibold mt-4">External Advisors</h4>
                <p> Araam Zaremehrjardi and Joanna Lopez, Department of Computer Science, UNR </p>
                <p>Dr. Laura Crosswell, Reynolds School of Journalism, UNR </p>
            <hr className="border-t-8 border-black mb-5"/>
        </div>


        <div id="description" className="text-justify justify-left"> 
            <h1 className="text-2xl mb-2 font-bold">What is WaveBrigade?</h1>
            <p className="mb-4">WaveBrigade, inspired by Kahoot and TopHat, is a web-based platform with the purpose of deepening the learning experience by providing instructors with an interactive and user-friendly interface to create lesson plans for students. These lesson plans will be used and presented to students to collect real-time responses from them, utilizing the EmotiBit. In addition, this data will be illustrated through charts and graphs with consideration of their respective data type. WaveBrigade offers an environment where instructors can create virtual lobbies, create lesson plans, and introduce different types of media (such as videos and images) to enhance engagement amongst students. Students can join these lobbies with an access code, participate in the session, and capture their reactions to the media via the EmotiBit. Therefore, students can understand and reflect on the data captured to better understand the lesson material. </p>
        <p>WaveBrigade’s main functionality for instructors includes the creation of virtual lobbies, lesson plans, and the ability to manage a dynamic dashboard containing the media chosen, and the data collected from specific students. The host will be able to record the lobby as well as manage the data report by viewing or downloading it. A live chat functionality will be included for students and instructors to talk to each other when they need to. Our goal is not only to provide a platform for real-time interaction but to create a sense of community and resource-sharing among educators and students. </p>
        </div>


        <div id="demo" className="flex justify-center mt-10 mb-3">
            {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/2zckJY8m4QI?si=Hu30vmaeClmIzcDj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
            <iframe className="w-3/5 h-[500px]" src="https://www.youtube.com/embed/2zckJY8m4QI?si=MpPSjcNKvfx_Sjb4" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>        
        </div>

        <div className="flex flex-col align-items-center">
            
            <button className={`content-center flex justify-center font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out bg-[#7F56D9] hover:bg-violet-500 text-white`}>Check it out!</button>
            
        </div>


            <div id="resources" className="justify-left">
                <h1 className="text-4xl mt-20 font-bold text-center">Check out some of our resources!</h1>
                <h1 className="text-2xl mb-2 font-bold">Problem Domain Book</h1>
                <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781663728289/" target="_blank" rel="noopener noreferrer">
                    <p className="underline pb-2 font-bold">The Big Ideas Behind Reliable, Scalable, and Maintainable Systems. By M. Kleppmann,  Sebastopol, Ca: O’reilly Media, 2018. </p>
                </a>

                <p className="pb-4">A book that provides an understanding of the need for real-time data collection, while giving a comprehensive overview of modern data architecture, data management, and processing. This is crucial for creating a project that collects and visualizes biometric data. Furthermore, Kleppmann highlights the importance of making an application that is scalable, reliable, and maintainable, thus making the book a resource for creating data-driven web applications. </p>

                <h1 className="text-2xl mb-2 font-bold">Reference Articles</h1>
                <a href="https://doi.org/10.1109/cic.2004.1443001." target="_blank" rel="noopener noreferrer">
                    <p className="underline pb-2 font-bold">M. Oefinger, W. Zong, M. Krieger, and R. G. Mark, “An interactive web-based tool for multi-scale physiological data visualization,” pp. 569–571, Jul. 2005</p>
                </a>
                <p className="pb-3">Journal article that introduces a web-based tool that improves the accuracy and efficiency of analyzing long-term ECG data in cardiovascular studies. The article highlights the development of the tool that enables real-time visualization and analysis of ECG signals. A “point-and-click” interface is acknowledged by the study as well which allows users to switch between data. The tool’s approach to data management and visualization can help improve WaveBrigade’s capabilities in designing a user-friendly platform. </p>
                

                <a href="https://doi.org/10.1177/1477878518805308" target="_blank" rel="noopener noreferrer"><p className="underline pb-2 font-bold">J. R. Reidenberg and F. Schaub, “Achieving Big Data Privacy In Education,” Theory and Research in Education, vol. 16, no. 3, pp. 263–279, Oct. 2018</p></a>

                <p className="pb-4">Journal article that describes the importance of Big Data that creates privacy risks when used in educational technologies. The article highlights the importance of transparency, security, and accountability in Big Data for education. This is particularly important, as a major part of the functionality of WaveBrigade is its data collection and handling. The goal is to be transparent with the user by letting them know where the data is going and asking if they consent to the data being collected. </p>
            </div>

            <div id="project-resources" className="text-justify justify-left">
                <h1 className="text-2xl mb-2 font-bold">Project Related Websites</h1>
                <a href="https://www.emotibit.com/" target="_blank" rel="noopener noreferrer"><p className="underline pb-2 font-bold">EmotiBit</p>
                <p className="pb-2">The EmotiBit website offers a lot of useful information about the device’s capabilities and data formats. Documentation on data collection and visualization, as well as its usage guides, will help WaveBrigade with incorporating EmotiBit into the platform for real-time biometric data tracking. </p></a>
            </div>
    </div>
    );

}

