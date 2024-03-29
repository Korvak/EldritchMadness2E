//this is a file for commenting only. No code should be placed here.
/** Bodypart
 * 
 * A bodypart item represents a bodypart. No Actor should be without bodyparts since to attack, you have to target bodyparts.
 * Every actor must have one root bodypart which is linked to the @hp attribute and has a @maxLinkDmg of 1.0.
 * Bodyparts are essential since combat is based on targeting and doing damage to bodyparts.
 * 
 * @implements {BaseItem, Destroyable, Repairable, Upgradable}
 * 
 */
/** partType
 * 
 * @param {PartType} partType : the type of the bodypart it is:
 *                                  
 *                                  @torso     : by convention the main body part and the root of the body.
 *                                  @arm       : a body part which can equip and use weapons. It is taken into account when using items. 
 *                                  @leg       : by convention defines a part that is used for moving. When broken should reduce @mov
 *                                  @organ     : by convention an organ which can be a sensory one or a normal one like a stomach.
 *                                  @vestigial : by convention a part that is not linked to the actor attributes or useless.
 */
/** 
 * @param {number} targetDifficultyMult : a normalized percentage which defines how difficult it is to target that body part.
 * 
 * @param {Bodypart} attachedTo : the bodypart ID this bodypart is attached to. Can be null in case of root parts such as the torso.
 * 
 * @param {Dictionary(string : BodyLink)} bodySync : a dictionary of BodyLink objects. Used to determine what damage is applied to
 *                                                 the owning actor when the durability of the bodypart is decreased.
 */
/** BodyLink
 * 
 * @class @BodyLink
 * {
 *  @param {boolean} linked : wether this bodypart should do damage to the owning actor when losing durability.
 *                             if set to false, does no damage when losing durability.
 * 
 *  @param {Attribute} linkedToStats : the stat this bodypart reduces when losing durability. Must be an attribute.
 *  
 *  @param {number} linkDmgConvRate : the normalized percentage of how much durability lost is converted into damage.
 *                                      if set to 1.0 then for every 1 durability lost, 1 point of the attribute is removed.
 * 
 * @param {number} minDurabilityLink : the normalized percentage of the minimum durability allowed for the link dmg to occur.
 *                                      if set to 0.0 then the owner will be damages until the bodypart is broken.
 *                                      if set to -1.0 then the owner will be damage even after the bodypart is broken.
 * 
 * @param {number} maxLinkDmg : the normalized percentage of the max amount of attribute loss it can incur. 
 *                              This is only valid from 100% to 0% durability and takes into account durability gain.
 * 
 * @param {number} linkTotDmg : the normalized percentage of the amount of attribute loss incurred. This is used by maxLinkDmg
 *                              To determine wether to keep removing points of the attribute or not. When the bodypart is repaired,
 *                              This stat is decreased accordingly.
 * }
 */
/** EquipLayer
 * 
 * @class @EquipLayer
 * {
 *  @param {number} maxEquippables : the maximum number of equippable objects that can be equipped to this bodypart at the same time.
 * 
 *  @param {Array(Tags)} allowedTags : a list of tags for allowed equipment to wear/equip on the bodypart. 
 *                                           Should never contain "bodypart".
 * 
 *  @param {enum_EquippableType} allowedEquippables : The type of Equippable item that can be equipped on the bodypart.    
 * 
 *     @CLOTHES        : clothes that cover the body and offer close to no protection.
 *     @ARMOR          : light or heavy armor that offers protection and may have additional effects when hit or dodging.
 *     @ORNAMENTS      : ornaments like jewelry that don't cover the body but may offer various effects when worn.
 *     @GEAR           : CLOTHES and ARMOR.
 *     @APPAREL        : CLOTHES and ORNAMENTS.
 *     @BATTLE_REGALIA : ARMOR and ORNAMENTS.
 *     @ANY            : ARMOR, CLOTHES and ORNAMENTS.
 * 
 *  @param {Array(Equippable)} equipped : the list of Foundry IDs of the items equipped to this bodypart.
 * 
 * 
 * }
 * 
 */