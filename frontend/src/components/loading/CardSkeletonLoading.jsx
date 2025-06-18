import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function CardSkeletonLoading() {
  return (
    <>
      <Skeleton
        height={349}
        width={100}
        borderRadius={40}
        baseColor="#ffe34c"
        highlightColor="#909098"
      />
      <Skeleton
        height={443}
        width={100}
        borderRadius={40}
        baseColor="#ffe34c"
        highlightColor="#909098"
      />
      <Skeleton
        height={500}
        width={350}
        borderRadius={40}
        baseColor="#ffd700"
        highlightColor="#909098"
      />
      <Skeleton
        height={443}
        width={100}
        borderRadius={40}
        baseColor="#ffe34c"
        highlightColor="#909098"
      />
      <Skeleton
        height={349}
        width={100}
        borderRadius={40}
        baseColor="#ffe34c"
        highlightColor="#909098"
      />
    </>
  );
}
