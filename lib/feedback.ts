export type LessonReview={id:string;name:string;rating:number;comment:string;createdAt:string;updatedAt:string;canEdit:boolean;canDelete:boolean};
export type ReviewSummary={average:number;total:number;distribution:number[]};
export function reviewInput(raw:unknown):{rating:number;comment:string}|null{
 if(!raw||typeof raw!=='object')return null;
 const b=raw as Record<string,unknown>;
 if(!Number.isInteger(b.rating)||Number(b.rating)<1||Number(b.rating)>5||typeof b.comment!=='string')return null;
 const comment=b.comment.trim();
 if(comment.length>2000)return null;
 return {rating:Number(b.rating),comment};
}
