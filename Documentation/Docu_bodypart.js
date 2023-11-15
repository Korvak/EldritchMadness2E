//this is a file for commenting only. No code should be placed here.
/** Bodypart
 * 
 * A bodypart item represents a bodypart. No Actor should be without bodyparts since to attack, you have to target bodyparts.
 * Every actor must have one root bodypart which is linked to the @hp attribute and has a @maxLinkDmg of 1.0.
 * 
 * @implements {BaseItem, Repairable, Upgradable}
 * 
 * @param {PartType} partType : the type of the bodypart it is:
 *                                  @torso     : by convention the main body part.
 *                                  @arm       : a body part which can equip and use weapons. It is taken into account when using items. 
 *                                  @leg       : by convention defines a part that is used for moving. When broken should reduce @mov
 *                                  @organ     : by convention an organ which can be a sensory one or a normal one like a stomach.
 *                                  @vestigial : by convention a part that is not linked to the actor attributes or useless.
 * 
 * 
 * @param {Array(Tags)} allowedEquippables : a list of tags for allowed equipment to wear/equip on the bodypart. 
 *                                           Should never contain "bodypart".
 * 
 * @param {Dictionary(string : Equippable)} equipped : a dictionary/json object of bodypart slot : Equippable item ID. 
 *                                              Used to determine what is equipped and what can be equipped.
 *
 * @bodySync {
 *  @param {boolean} linked : wether this bodypart should do damage to the owning actor when losing durability.
 *                             if set to false, does no damage when losing durability.
 * 
 *  @param {Attribute} linkedToStats : the stat this bodypart reduces when losing durability. Must be an attribute.
 *  
 *  @param {number} linkDmgConvRate : the normalized percentage of how much durability lost is converted into damage.
 *                                      if set to 1.0 then for every 1 durability lost, 1 point of the attribute is removed.
 * 
 * @param {number} maxLinkDmg : the normalized percentage of the max amount of attribute loss it can incur. 
 *                              This is only valid from 100% to 0% durability and takes into account durability gain.
 * 
 * @param {number} linkTotDmg : the normalized percentage of the amount of attribute loss incurred. This is used by maxLinkDmg
 *                              To determine wether to keep removing points of the attribute or not. When the bodypart is repaired,
 *                              This stat is decreased accordingly.
 * }
 * 
 *  
 * @param {Bodypart} attachedTo : the bodypart ID this bodypart is attached to. Can be null in case of root parts such as the torso.
 * 
 * 
 */