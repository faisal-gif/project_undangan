import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const names = [
    { text: "Faisal", size: 120 },
    { text: "React", size: 90 },
    { text: "Laravel", size: 100 },
    { text: "JavaScript", size: 80 },
    { text: "Tailwind", size: 70 },
    { text: "Next.js", size: 110 },
];

const colors = ["#FFC0CB", "#FFB6C1", "#FF69B4", "#FF1493", "#DB7093", "#C71585"];

export default function NameBubblesPhysics() {
    const sceneRef = useRef(null);
    const engineRef = useRef(Matter.Engine.create());

    useEffect(() => {
        const engine = engineRef.current;
        const render = Matter.Render.create({
            element: sceneRef.current,
            engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: "#0f172a",
            },
        });

        // Buat dinding
        const walls = [
            Matter.Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 20, { isStatic: true }),
            Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 20, { isStatic: true }),
            Matter.Bodies.rectangle(0, window.innerHeight / 2, 20, window.innerHeight, { isStatic: true }),
            Matter.Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 20, window.innerHeight, { isStatic: true }),
        ];

        engine.gravity.y = 0;
        engine.gravity.x = 0;

        // Buat bubble
        const bubbles = names.map((item) => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const body = Matter.Bodies.circle(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                item.size / 2,
                {
                    restitution: 1, // mantul sempurna
                    frictionAir: 0, // biar nggak melambat
                    render: {
                        fillStyle: randomColor,
                        strokeStyle: "#fff",
                        lineWidth: 2,
                    },
                    label: item.text,
                }
            );

            // velocity awal acak
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5,
            });

            return body;
        });

        // Dorongan kecil acak tiap 1 detik
        setInterval(() => {
            bubbles.forEach((bubble) => {
                Matter.Body.applyForce(bubble, bubble.position, {
                    x: (Math.random() - 0.5) * 0.001,
                    y: (Math.random() - 0.5) * 0.001,
                });
            });
        }, 1000);

        Matter.World.add(engine.world, [...walls, ...bubbles]);

        // Pakai Runner supaya update terus
        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);

        Matter.Events.on(render, "afterRender", () => {
            const context = render.context;

            // Gambar gradient background
            const gradient = context.createLinearGradient(0, 0, 0, window.innerHeight);
            gradient.addColorStop(0, "#1e3a8a");
            gradient.addColorStop(1, "#0c1e3e");
            context.fillStyle = gradient;
            context.fillRect(0, 0, window.innerWidth, window.innerHeight);


            context.font = "bold 16px Arial";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.textBaseline = "middle";
            bubbles.forEach((bubble) => {
                context.fillText(bubble.label, bubble.position.x, bubble.position.y);
            });
        });

        // Tambahkan random force tiap 2 detik
        const forceInterval = setInterval(() => {
            bubbles.forEach((bubble) => {
                Matter.Body.applyForce(bubble, bubble.position, {
                    x: (Math.random() - 0.5) * 0.002,
                    y: (Math.random() - 0.5) * 0.002,
                });
            });
        }, 2000);

        return () => {
            clearInterval(forceInterval);
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
            Matter.World.clear(engine.world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    }, []);

    return <div ref={sceneRef}></div>;
}
