const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, SVG } = widget;

const STICKER_COLORS = {
  Click: "#FF6B6B",
  View: "#4ECDC4",
  Completed: "#45B7D1"
};


const buttonSrc = `
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15.5" stroke="black" stroke-opacity="0.1" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M17 8H15V15H8V17H15V24H17V17H24V15H17V8Z" fill="black" fill-opacity="0.8"/>
  </svg>
`

function Widget() {
  const [stickers, setStickers] = useSyncedState<Array<{
    type: string;
    name: string;
    description: string;
  }>>('stickers', []);

  return (
    <AutoLayout
      direction="vertical"
      spacing={8}
      padding={16}
    >
      <AutoLayout
        direction="horizontal"
        spacing={8}
        fill="#FFFFFF"
        cornerRadius={8}
        onClick={async () => {
          await new Promise((resolve) => {
            figma.showUI(__html__, { width: 300, height: 400 });
            figma.ui.on("message", (msg) => {
              if (!msg.pluginMessage) return;
              
              if (msg.pluginMessage === "close") {
                figma.closePlugin();
                resolve(void 0);
              } else if (msg.pluginMessage.type === "create-sticker") {
                const { eventType, eventName, eventDescription } = msg.pluginMessage;
                setStickers([
                  ...stickers,
                  {
                    type: eventType,
                    name: eventName,
                    description: eventDescription
                  }
                ]);
                resolve(void 0);
              }
            });
          });
        }}
      >
        <SVG src={buttonSrc} />
      </AutoLayout>

      {stickers.map((sticker, index) => (
        sticker.type && (
          <AutoLayout
            key={index}
            direction="vertical"
            padding={8}
            fill={STICKER_COLORS[sticker.type as keyof typeof STICKER_COLORS]}
            cornerRadius={4}
            width={200}
        >
          <Text fontSize={12} fill="#FFFFFF">{sticker.type}</Text>
          <Text fontSize={14} fill="#FFFFFF" fontWeight="bold">{sticker.name}</Text>
          <Text fontSize={12} fill="#FFFFFF">{sticker.description}</Text>
          </AutoLayout>
        )
      ))}
    </AutoLayout>
  );
}

widget.register(Widget);
