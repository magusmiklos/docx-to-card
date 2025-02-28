import { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import "./App.css";

const App = () => {
    const [sections, setSections] = useState([]);
    const [parentHeader, setParentHeader] = useState('h1');
    const [sectionHeader, setSectionHeader] = useState('h2');
    const [ViewMode, setViewMode] = useState(0);
    const [randomSection, setRandomSection] = useState(null);
    const [showBody, setShowBody] = useState(false);
    const [randomLeft, setRandomLeft] = useState("");
    const [randomStart, setRandomStart] = useState(0);

    const handeTestClick = () => {
        setViewMode(2);
        selectRandomSection();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();

            const { value: html, messages } = await mammoth.convertToHtml(
                { arrayBuffer },
                {
                    convertImage: mammoth.images.imgElement((image) => {
                        return image.read('base64').then((base64) => {
                            const imageUrl = `data:${image.contentType};base64,${base64}`;
                            return { src: imageUrl };
                        });
                    })
                }
            );

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const elements = Array.from(doc.body.children);

            const newSections = [];
            let currentSection = null;
            let currentPart = "";

            elements.forEach(element => {
                const tag = element.tagName.toLowerCase();
                const content = element.innerHTML;
                const imgSrc = element.querySelector('img')?.getAttribute('src');

                if (tag === parentHeader) {
                    currentPart = content;
                } else if (tag === sectionHeader) {
                    if (currentSection) {
                        newSections.push(currentSection);
                    }

                    currentSection = {
                        part: currentPart,
                        title: content,
                        body: [],
                    };
                } else if (currentSection) {
                    if (imgSrc) {
                        currentSection.body.push(`<img src="${imgSrc}" alt="image" />`);
                    } else {
                        currentSection.body.push(content);
                    }
                }
            });

            if (currentSection) newSections.push(currentSection);
            setSections(newSections);
            setRandomStart(newSections.length)
            setRandomLeft(newSections.length.toString() + "/" + newSections.length.toString())
            setViewMode(1);

        } catch (error) {
            console.error('Error processing document:', error);
        }
    };

    const selectRandomSection = () => {
        if (sections.length > 0) {
            const randomIndex = Math.floor(Math.random() * sections.length);
            setRandomSection(sections[randomIndex]);
            setShowBody(false);
        } else {
            window.location.reload()
        }
    };

    const selectRandomAndTrash = () => {
        if (randomSection) {
            if (sections.length === 1) {
                window.location.reload()
            } else {

                setSections(prevSections => prevSections.filter(section => section !== randomSection));
                setRandomSection(null); // Clear current selection to avoid stale state
            }
        } else {
            window.location.reload();
        }
    };

    // Run selectRandomSection when sections are updated
    useEffect(() => {
        if (sections.length > 0 && randomSection === null && ViewMode === 2) {
            selectRandomSection();
            handleSectionsLeft();
        }
    }, [sections]); // Runs whenever `sections` updates

    const handleSectionsLeft = () => {
        setRandomLeft(sections.length.toString() + "/" + randomStart.toString());
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white sm:p-6">
            {ViewMode === 0 ? (
                <div className="flex flex-col justify-center items-center sm:mt-32">
                    <h1 className="font-extrabold mt-20 mb-20 text-2xl sm:text-5xl">
                        .docx to Study Cards🥶
                    </h1>
                    <h2 className="text-xl w-fit m-5 sm:w-1/2 mb-10 text-center">
                        Upload a .docx document and convert it into study cards. With the parent and node values you can adjust the broad topic and the topic (it works by looking up the heading tags in the .docx file and grouping them accordingly). For example, if your .docx is structured with h1 for broad topics and h2 for details, you should use h1 for parent and h2 for node.
                    </h2>
                    <div className="upload-section mx-2 mb-6">
                        <input
                            type="file"
                            accept=".docx"
                            onChange={handleFileUpload}
                            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out" />
                    </div>
                    <div className="flex flex-wrap justify-center items-center space-x-4 mb-4">
                        <p className="font-bold">Parent</p>
                        <select
                            value={parentHeader}
                            onChange={(e) => setParentHeader(e.target.value)}
                            className="py-2 px-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="h1">H1</option>
                            <option value="h2">H2</option>
                            <option value="h3">H3</option>
                        </select>
                        <p className="font-bold">Node</p>
                        <select
                            value={sectionHeader}
                            onChange={(e) => setSectionHeader(e.target.value)}
                            className="py-2 px-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="h2">H2</option>
                            <option value="h3">H3</option>
                            <option value="h4">H4</option>
                        </select>
                    </div>
                </div>
            ) : ViewMode === 1 ? (
                <div className="max-w-4xl flex flex-col items-center justify-center mx-auto shadow-lg rounded-lg p-8">
                    <div className="w-full flex justify-center items-center">
                        <button
                            onClick={handeTestClick}
                            className="text-4xl sm:text-5xl p-8 cursor-pointer"
                        >
                            🥸
                        </button>
                    </div>
                    <div className="sections space-y-6 w-full">
                        {sections.map((section, index) => (
                            <div key={index} className="section bg-gray-700 p-6 rounded-lg shadow-md">
                                <div
                                    className="text-2xl font-semibold text-red-400 mb-4"
                                    dangerouslySetInnerHTML={{ __html: section.part }}
                                />
                                <div
                                    className="text-2xl font-semibold text-gray-100 mb-4"
                                    dangerouslySetInnerHTML={{ __html: section.title }}
                                />
                                <div
                                    className="body text-gray-300 space-y-4"
                                    dangerouslySetInnerHTML={{
                                        __html: section.body
                                            .map(content => content.replace(/\n/g, '<br />'))
                                            .map(content => `<p>${content}</p>`)
                                            .join(''),
                                    }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl flex flex-col items-center justify-center mx-auto">
                    <p className="font-bold">{randomLeft}</p>
                    {randomSection && (
                        <div className="section bg-gray-700 p-6 rounded-lg shadow-md text-center w-fit m-4">
                            <div className="text-2xl font-semibold text-red-400 mb-4" dangerouslySetInnerHTML={{ __html: randomSection.part }} />
                            <div className="text-2xl font-semibold text-gray-100 mb-4" dangerouslySetInnerHTML={{ __html: randomSection.title }} />
                            {!showBody ? (
                                <div>
                                    <button
                                        onClick={() => setShowBody(true)}
                                        className="mt-6 px-4 text-4xl text-center py-4 cursor-pointer"
                                    >
                                        👀
                                    </button>
                                </div>
                            ) : (
                                <div className="body text-gray-300 text-left space-y-4 mt-4" dangerouslySetInnerHTML={{
                                    __html: randomSection.body
                                        .map(content => content.replace(/\n/g, '<br />'))
                                        .map(content => `<p>${content}</p>`)
                                        .join(''),
                                }} />
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap justify-center items-center space-x-4 mt-6">
                        <button
                            onClick={selectRandomAndTrash}
                            className="px-4 text-3xl sm:text-4xl py-4 cursor-pointer"
                        >
                            🤮
                        </button>
                        <button
                            onClick={selectRandomSection}
                            className="px-4 text-3xl sm:text-4xl py-4 cursor-pointer"
                        >
                            ⏭️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

