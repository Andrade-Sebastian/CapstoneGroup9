export default function ExampleCarouselImage(props: { text: string }) {
    return (
      <img
        src="https://i.dailymail.co.uk/1s/2024/11/16/04/92135043-0-image-a-1_1731729974205.jpg"
        alt={props.text}
        className="d-block w-100"
      />
    );
  }
  